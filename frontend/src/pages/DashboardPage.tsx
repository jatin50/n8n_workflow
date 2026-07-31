import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import {
  fetchWorkspaces,
  createWorkspace,
  renameWorkspace,
  deleteWorkspace,
  type Workspace,
} from "../lib/workspace.api";

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const { data: workspaces, isLoading, error } = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createWorkspace(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setNewName("");
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameWorkspace(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setRenamingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate(newName.trim());
  }

  function startRename(ws: Workspace) {
    setRenamingId(ws.id);
    setRenameValue(ws.name);
  }

  function submitRename(id: string) {
    if (!renameValue.trim()) return;
    renameMutation.mutate({ id, name: renameValue.trim() });
  }

  function confirmDelete(ws: Workspace) {
    if (window.confirm(`Delete workspace "${ws.name}"? This deletes everything inside it.`)) {
      deleteMutation.mutate(ws.id);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Workspaces</h1>
            <p className="text-sm text-slate-400">
              Signed in as {user?.name} ({user?.email})
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Log out
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New workspace name"
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
          <p className="text-sm text-red-400">Couldn't create that workspace. Try again.</p>
        )}

        {isLoading && <p className="text-slate-400 text-sm">Loading workspaces...</p>}
        {error && <p className="text-red-400 text-sm">Couldn't load workspaces.</p>}

        <div className="space-y-2">
          {workspaces?.length === 0 && (
            <p className="text-slate-500 text-sm">
              No workspaces yet — create one above to get started.
            </p>
          )}

          {workspaces?.map((ws) => (
            <div
              key={ws.id}
              className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-3"
            >
              {renamingId === ws.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-2 py-1 text-sm outline-none focus:border-slate-500"
                  />
                  <button
                    onClick={() => submitRename(ws.id)}
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
                  <Link to={`/workspaces/${ws.id}`} className="flex-1">
                    <p className="font-medium">{ws.name}</p>
                    <p className="text-xs text-slate-500">
                      {ws._count?.workflows ?? 0} workflow
                      {ws._count?.workflows === 1 ? "" : "s"}
                    </p>
                  </Link>
                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() => startRename(ws)}
                      className="text-slate-400 hover:text-slate-200 transition"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => confirmDelete(ws)}
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
      </div>
    </div>
  );
}

export default DashboardPage;
