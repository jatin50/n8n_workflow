import api from "./axios";

export interface ApiNode {
  id: string;
  type: string;
  positionX: number;
  positionY: number;
  configuration: Record<string, unknown>;
}

export interface ApiConnection {
  id?: string;
  sourceNode: string;
  targetNode: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export async function fetchGraph(
  workflowId: string
): Promise<{ nodes: ApiNode[]; connections: ApiConnection[] }> {
  const { data } = await api.get(`/api/workflows/${workflowId}/graph`);
  return data;
}

export async function saveGraph(
  workflowId: string,
  nodes: ApiNode[],
  connections: ApiConnection[]
): Promise<void> {
  await api.put(`/api/workflows/${workflowId}/graph`, { nodes, connections });
}
