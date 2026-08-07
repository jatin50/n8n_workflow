import api from "./axios";

export type ExecutionStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface Execution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: string | null;
  finishedAt: string | null;
  duration: number | null;
  logs: string | null;
}

export interface ExecutionDataRow {
  id: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  input: unknown;
  output: unknown;
}

export async function startWorkflowExecution(workflowId: string): Promise<Execution> {
  const { data } = await api.post(`/api/workflows/${workflowId}/executions`);
  return data.execution;
}

export async function fetchExecutions(workflowId: string): Promise<Execution[]> {
  const { data } = await api.get(`/api/workflows/${workflowId}/executions`);
  return data.executions;
}

export async function fetchExecutionLogs(
  executionId: string
): Promise<{ execution: Execution; data: ExecutionDataRow[] }> {
  const { data } = await api.get(`/api/executions/${executionId}/logs`);
  return data;
}
