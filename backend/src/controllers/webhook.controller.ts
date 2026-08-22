import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { executionQueue } from "../queue/executionQueue";

export async function receiveWebhook(req: Request, res: Response) {
  const token = req.params.token as string;

  const trigger = await prisma.trigger.findUnique({ where: { webhookToken: token } });
  if (!trigger) {
    return res.status(404).json({ error: "Unknown webhook" });
  }

  const nodeCount = await prisma.node.count({ where: { workflowId: trigger.workflowId } });
  if (nodeCount === 0) {
    return res.status(400).json({ error: "This workflow has no nodes to run" });
  }

  const execution = await prisma.execution.create({
    data: { workflowId: trigger.workflowId, status: "PENDING" },
  });

  await executionQueue.add("run", {
    executionId: execution.id,
    workflowId: trigger.workflowId,
    triggerNodeId: trigger.nodeId,
    payload: {
      body: req.body,
      headers: req.headers,
      receivedAt: new Date().toISOString(),
    },
  });

  return res.status(202).json({ executionId: execution.id });
}
