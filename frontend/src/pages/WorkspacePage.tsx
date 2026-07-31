import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWorkspace } from "../lib/workspace.api";
import {
    fetchWorkflows,
    createWorkflow,
    renameWorkflow,
    deleteWorkflow,
    type Workflow,
} from "../lib/workflow.api";

function WorkspacePage() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const queryClient = useQueryClient();

    const [newName, setNewName] = useState("");
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");

    const { data: workspace } = useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: () => fetchWorkspace(workspaceId!),
        enabled: !!workspaceId,
    });

    const { data: workflows, isLoading, error } = useQuery({
        queryKey: ["workflows", workspaceId],
        queryFn: () => fetchWorkflows(workspaceId!),
        enabled: !!workspaceId,
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => createWorkflow(workspaceId!, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] });
            setNewName("");
        },
    });

    const renameMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => renameWorkflow(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] });
            setRenamingId(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteWorkflow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] });
        },
    });

    function handleCreate(e: FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;
        createMutation.mutate(newName.trim());
    }

    function startRename(wf: Workflow) {
        setRenamingId(wf.id);
        setRenameValue(wf.name);
    }

    function submitRename(id: string) {
        if (!renameValue.trim()) return;
        renameMutation.mutate({ id, name: renameValue.trim() });
    }

    function confirmDelete(wf: Workflow) {
        if (window.confirm(`Delete workflow "${wf.name}"?`)) {
            deleteMutation.mutate(wf.id);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-300">
                        &larr; Workspaces
                    </Link>
                    <h1 className="text-xl font-semibold mt-1">{workspace?.name ?? "Workspace"}</h1>
                </div>

                <form onSubmit={handleCreate} className="flex gap-2">
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New workflow name"
                        className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md px-4 py-2 text-sm font-medium transition"
                    >
                        {createMutation.isPending ? "Creating..." : "Create"}
                    </button>
                </form>
                {createMutation.isError && (
                    <p className="text-sm text-red-400">Couldn't create that workflow. Try again.</p>
                )}

                {isLoading && <p className="text-slate-400 text-sm">Loading workflows...</p>}
                {error && <p className="text-red-400 text-sm">Couldn't load workflows.</p>}

                <div className="space-y-2">
                    {workflows?.length === 0 && (
                        <p className="text-slate-500 text-sm">
                            No workflows yet — create one above to get started.
                        </p>
                    )}

                    {workflows?.map((wf) => (
                        <div
                            key={wf.id}
                            className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-3"
                        >
                            {renamingId === wf.id ? (
                                <div className="flex-1 flex gap-2">
                                    <input
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        autoFocus
                                        className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-2 py-1 text-sm outline-none focus:border-slate-500"
                                    />
                                    <button
                                        onClick={() => submitRename(wf.id)}
                                        className="text-sm text-indigo-400 hover:underline"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setRenamingId(null)}
                                        className="text-sm text-slate-500 hover:underline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <p className="font-medium">{wf.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {wf.active ? "Active" : "Inactive"} · v{wf.version}
                                            {wf.description ? ` · ${wf.description}` : ""}
                                        </p>
                                    </div>
                                    <div className="flex gap-3 text-sm">
                                        <button
                                            onClick={() => startRename(wf)}
                                            className="text-slate-400 hover:text-slate-200 transition"
                                        >
                                            Rename
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(wf)}
                                            className="text-red-400 hover:text-red-300 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-slate-600 text-xs">
                    Opening the visual editor for a workflow lands in Phase 4.
                </p>
            </div>
        </div>
    );
}

export default WorkspacePage;
