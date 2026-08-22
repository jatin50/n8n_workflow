import { Queue } from "bullmq";
import { connection } from "./connection";

export const EXECUTION_QUEUE_NAME = "workflow-execution";

export interface ExecutionJobData {
  executionId?: string; // present for manual/webhook runs; absent for schedule ticks, which create their own
  workflowId: string;
  triggerNodeId?: string; // which trigger node's output to override with real data
  payload?: unknown; // webhook: { body, headers, receivedAt }
}

export const executionQueue = new Queue<ExecutionJobData>(EXECUTION_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    removeOnComplete: { age: 3600 }, // keep completed jobs for 1hr, then BullMQ cleans them up
    removeOnFail: { age: 86400 }, // keep failed jobs for 1 day for debugging
  },
});
