import { useAuthStore } from "../store/auth.store";

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <button
            onClick={() => logout()}
            className="text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Log out
          </button>
        </div>
        <p className="text-slate-400">
          Signed in as <span className="text-slate-200">{user?.name}</span> ({user?.email})
        </p>
        <p className="text-slate-500 text-sm">
          Workspace/workflow listing lands here in Phase 3.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;
