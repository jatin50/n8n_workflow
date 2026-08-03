import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

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

export async function saveGraph(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = req.params.id as string;
  const nodes: IncomingNode[] = req.body?.nodes ?? [];
  const connections: IncomingConnection[] = req.body?.connections ?? [];

  const workflow = await assertWorkflowOwnership(id, userId);
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  // Full-replace strategy: wipe the workflow's current graph and recreate it
  // from what the client sends. Simple and correct for a canvas that always
  // saves its whole current state — connections are deleted first since
  // they have foreign keys into nodes.
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

    await tx.workflow.update({
      where: { id },
      data: { version: { increment: 1 } },
    });
  });

  return res.json({ ok: true });
}
