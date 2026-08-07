import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  startWorkflowExecution,
  fetchExecutions,
  fetchExecutionLogs,
  type Execution,
  type ExecutionStatus,
} from "../lib/executionHistory.api";
import { getNodeTypeDef } from "../nodes/nodeTypes";

const STATUS_CLASSES: Record<ExecutionStatus, string> = {
  PENDING: "text-slate-400 bg-slate-800",
  RUNNING: "text-indigo-300 bg-indigo-950",
  SUCCESS: "text-emerald-300 bg-emerald-950",
  FAILED: "text-red-300 bg-red-950",
  CANCELLED: "text-slate-400 bg-slate-800",
};

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function ExecutionRow({ execution }: { execution: Execution }) {
  const [expanded, setExpanded] = useState(false);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["execution-logs", execution.id],
    queryFn: () => fetchExecutionLogs(execution.id),
    enabled: expanded,
  });

  let parsedLogs: Array<{
    nodeId: string;
    type: string;
    status: string;
    error?: string;
    durationMs: number;
  }> = [];
  try {
    parsedLogs = execution.logs ? JSON.parse(execution.logs) : [];
  } catch {
    // logs may hold a plain error string instead of JSON (structural
    // failures like a cycle) — that's fine, we just skip the per-node table.
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_CLASSES[execution.status]}`}
          >
            {execution.status}
          </span>
          <span className="text-xs text-slate-500">
            {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : "Queued"}
          </span>
        </div>
        <span className="text-xs text-slate-500">{formatDuration(execution.duration)}</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-800 px-4 py-3 space-y-2">
          {parsedLogs.length > 0 &&
            parsedLogs.map((r) => (
              <div key={r.nodeId} className="text-xs flex items-center justify-between">
                <span className="text-slate-300">{getNodeTypeDef(r.type).label}</span>
                <span
                  className={
                    r.status === "success"
                      ? "text-emerald-400"
                      : r.status === "failed"
                        ? "text-red-400"
                        : "text-slate-500"
                  }
                >
                  {r.status}
                  {r.error ? ` — ${r.error}` : ""}
                </span>
              </div>
            ))}

          {isLoading && <p className="text-xs text-slate-500">Loading node output...</p>}

          {logs?.data.map((row) => (
            <div key={row.id} className="text-xs">
              <p className="text-slate-500">{getNodeTypeDef(row.nodeType).label} output:</p>
              <pre className="text-slate-400 whitespace-pre-wrap">
                {JSON.stringify(row.output, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExecutionsPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const queryClient = useQueryClient();

  const { data: executions, isLoading } = useQuery({
    queryKey: ["executions", workflowId],
    queryFn: () => fetchExecutions(workflowId!),
    enabled: !!workflowId,
    // Keep polling while anything is still in flight, so status flips
    // from RUNNING to SUCCESS/FAILED without a manual refresh.
    refetchInterval: (query) => {
      const list = query.state.data as Execution[] | undefined;
      const hasActive = list?.some((e) => e.status === "PENDING" || e.status === "RUNNING");
      return hasActive ? 1500 : false;
    },
  });

  const runMutation = useMutation({
    mutationFn: () => startWorkflowExecution(workflowId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executions", workflowId] });
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to={`/workflows/${workflowId}`}
              className="text-sm text-slate-500 hover:text-slate-300"
            >
              &larr; Back to editor
            </Link>
            <h1 className="text-xl font-semibold mt-1">Execution history</h1>
          </div>
          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md px-4 py-2 text-sm font-medium transition"
          >
            {runMutation.isPending ? "Starting..." : "Run"}
          </button>
        </div>

        {isLoading && <p className="text-slate-400 text-sm">Loading...</p>}
        {executions?.length === 0 && (
          <p className="text-slate-500 text-sm">No runs yet — click Run to start one.</p>
        )}

        <div className="space-y-2">
          {executions?.map((ex) => (
            <ExecutionRow key={ex.id} execution={ex} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExecutionsPage;
