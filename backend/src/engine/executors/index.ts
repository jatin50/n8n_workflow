import { NodeExecutor } from "../types";
import manualTrigger from "./manualTrigger";
import webhookTrigger from "./webhookTrigger";
import scheduleTrigger from "./scheduleTrigger";
import httpRequest from "./httpRequest";
import ifNode from "./ifNode";
import setVariable from "./setVariable";

// Adding a 5th node type later (Phase 9) means: write its executor file,
// register it here, and add its config form to the frontend's
// NodeConfigPanel — nothing else in the engine needs to change.
export const EXECUTORS: Record<string, NodeExecutor> = {
  "trigger.manual": manualTrigger,
  "trigger.webhook": webhookTrigger,
  "trigger.schedule": scheduleTrigger,
  "http.request": httpRequest,
  "logic.if": ifNode,
  "data.setVariable": setVariable,
};

export function getExecutor(nodeType: string): NodeExecutor {
  const executor = EXECUTORS[nodeType];
  if (!executor) {
    throw new Error(`No executor registered for node type "${nodeType}"`);
  }
  return executor;
}
