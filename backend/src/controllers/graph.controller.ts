import { Request, Response } from "express";
import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { executionQueue } from "../queue/executionQueue";

interface IncomingNode {
  id: string; // client-generated id (React Flow's node.id) — used as the DB id too
  type: string;
  positionX: number;
  positionY: number;
  configuration?: unknown;
}

interface IncomingConnection {
  id?: string;
  sourceNode: string;
  targetNode: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

interface DbTrigger {
  nodeId: string;
  type: string;
  webhookToken: string | null;
}

async function assertWorkflowOwnership(workflowId: string, userId: string) {
  return prisma.workflow.findFirst({
    where: { id: workflowId, workspace: { ownerId: userId } },
  });
}

export async function getGraph(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = req.params.id as string;

  const workflow = await assertWorkflowOwnership(id, userId);
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const [nodes, connections] = await Promise.all([
    prisma.node.findMany({ where: { workflowId: id } }),
    prisma.connection.findMany({ where: { workflowId: id } }),
  ]);

  return res.json({ nodes, connections });
}

function scheduleJobId(nodeId: string) {
  return `schedule:${nodeId}`;
}

export async function saveGraph(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = req.params.id as string;
  const nodes: IncomingNode[] = req.body?.nodes ?? [];
  const connections: IncomingConnection[] = req.body?.connections ?? [];

  const workflow = await assertWorkflowOwnership(id, userId);
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }
  
  const existingTriggers = await prisma.trigger.findMany({ where: { workflowId: id } });
  const existingTriggerByNodeId = new Map<string, DbTrigger>(
    existingTriggers.map((t: DbTrigger) => [t.nodeId, t])
  );


  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.connection.deleteMany({ where: { workflowId: id } });
    await tx.node.deleteMany({ where: { workflowId: id } });

    if (nodes.length > 0) {
      await tx.node.createMany({
        data: nodes.map((n) => ({
          id: n.id,
          workflowId: id,
          type: n.type,
          positionX: n.positionX,
          positionY: n.positionY,
          configuration: (n.configuration ?? {}) as object,
        })),
      });
    }

    if (connections.length > 0) {
      await tx.connection.createMany({
        data: connections.map((c) => ({
          workflowId: id,
          sourceNode: c.sourceNode,
          targetNode: c.targetNode,
          sourceHandle: c.sourceHandle ?? null,
          targetHandle: c.targetHandle ?? null,
        })),
      });
    }

    const triggerNodes = nodes.filter(
      (n) => n.type === "trigger.webhook" || n.type === "trigger.schedule"
    );

    for (const node of triggerNodes) {
      const existing = existingTriggerByNodeId.get(node.id);
      const type = node.type === "trigger.webhook" ? "webhook" : "schedule";
      const configuration = (node.configuration ?? {}) as object;

      await tx.trigger.create({
        data: {
          workflowId: id,
          nodeId: node.id,
          type,
          configuration,
          // Reuse the previous token if this exact node already had one —
          // only generate a new one for genuinely new webhook nodes.
          webhookToken:
            type === "webhook"
              ? (existing?.webhookToken ?? crypto.randomBytes(16).toString("hex"))
              : null,
        },
      });
    }

    await tx.workflow.update({
      where: { id },
      data: { version: { increment: 1 } },
    });
  });

  // Reconcile BullMQ's repeatable jobs for schedule triggers OUTSIDE the DB
  // transaction (Redis isn't transactional with Postgres) — remove
  // schedules for nodes that no longer exist or are no longer schedule
  // triggers, then (re)register current ones with their current cron.
  const currentNodeIds = new Set(nodes.map((n) => n.id));
  const removedOrChangedScheduleNodeIds = existingTriggers
    .filter((t: DbTrigger) => t.type === "schedule")
    .map((t: DbTrigger) => t.nodeId)
    .filter((nodeId: string) => {
      const stillExists = currentNodeIds.has(nodeId);
      const stillSchedule = nodes.find((n) => n.id === nodeId)?.type === "trigger.schedule";
      return !stillExists || !stillSchedule;
    });

  for (const nodeId of removedOrChangedScheduleNodeIds) {
    await executionQueue.removeJobScheduler(scheduleJobId(nodeId));
  }

  const scheduleNodes = nodes.filter((n) => n.type === "trigger.schedule");
  for (const node of scheduleNodes) {
    const cron = (node.configuration as { cron?: string } | undefined)?.cron;
    if (!cron) continue;

    // upsertJobScheduler is create-or-update by id — safe to call on every
    // save, whether the cron changed or not.
    await executionQueue.upsertJobScheduler(
      scheduleJobId(node.id),
      { pattern: cron },
      { name: "scheduled-trigger", data: { workflowId: id, triggerNodeId: node.id } }
    );
  }

  return res.json({ ok: true });
}
