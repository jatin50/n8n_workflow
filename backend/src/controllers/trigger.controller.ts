import { Request, Response } from "express";
import prisma from "../lib/prisma";

interface DbTriggerFull {
  id: string;
  nodeId: string;
  type: string;
  configuration: unknown;
  webhookToken: string | null;
}

export async function listTriggers(req: Request, res: Response) {
  const userId = req.user!.userId;
  const workflowId = req.params.id as string;

  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, workspace: { ownerId: userId } },
  });
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const triggers = await prisma.trigger.findMany({ where: { workflowId } });

  // Build each webhook's full callable URL here rather than making the
  // frontend guess the API's own base URL.
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return res.json({
    triggers: triggers.map((t: DbTriggerFull) => ({
      id: t.id,
      nodeId: t.nodeId,
      type: t.type,
      configuration: t.configuration,
      webhookUrl: t.webhookToken ? `${baseUrl}/api/webhooks/${t.webhookToken}` : null,
    })),
  });
}
