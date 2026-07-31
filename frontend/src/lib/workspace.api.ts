import api from "./axios";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    _count?: { workflows: number };
}

export async function fetchWorkspaces(): Promise<Workspace[]> {
    const { data } = await api.get("/api/workspaces");
    return data.workspaces;
}

export async function fetchWorkspace(id: string): Promise<Workspace> {
    const { data } = await api.get(`/api/workspaces/${id}`);
    return data.workspace;
}

export async function createWorkspace(name: string): Promise<Workspace> {
    const { data } = await api.post("/api/workspaces", { name });
    return data.workspace;
}

export async function renameWorkspace(id: string, name: string): Promise<Workspace> {
    const { data } = await api.patch(`/api/workspaces/${id}`, { name });
    return data.workspace;
}

export async function deleteWorkspace(id: string): Promise<void> {
    await api.delete(`/api/workspaces/${id}`);
}
