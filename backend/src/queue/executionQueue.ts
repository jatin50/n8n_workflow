import { Queue } from "bullmq";
import { connection } from "./connection";

export const EXECUTION_QUEUE_NAME = "workflow-execution";

export interface ExecutionJobData {
  executionId: string;
  workflowId: string;
}

export const executionQueue = new Queue<ExecutionJobData>(EXECUTION_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    removeOnComplete: { age: 3600 }, // keep completed jobs for 1hr, then BullMQ cleans them up
    removeOnFail: { age: 86400 }, // keep failed jobs for 1 day for debugging
  },
});
