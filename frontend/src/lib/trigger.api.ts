import api from "./axios";

export interface TriggerInfo {
  id: string;
  nodeId: string;
  type: "webhook" | "schedule";
  configuration: Record<string, unknown>;
  webhookUrl: string | null;
}

export async function fetchTriggers(workflowId: string): Promise<TriggerInfo[]> {
  const { data } = await api.get(`/api/workflows/${workflowId}/triggers`);
  return data.triggers;
}
