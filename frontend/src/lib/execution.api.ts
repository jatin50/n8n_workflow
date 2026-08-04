import api from "./axios";

export type NodeStatus = "success" | "failed" | "skipped";

export interface NodeExecutionResult {
  nodeId: string;
  type: string;
  status: NodeStatus;
  output?: unknown;
  error?: string;
  durationMs: number;
}

export interface TestRunResult {
  status: "success" | "failed";
  results: NodeExecutionResult[];
}

export async function testWorkflow(workflowId: string): Promise<TestRunResult> {
  const { data } = await api.post(`/api/workflows/${workflowId}/test`);
  return data;
}
