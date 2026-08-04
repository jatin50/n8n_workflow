import { getNodeTypeDef } from "../nodes/nodeTypes";
import type { TestRunResult, NodeStatus } from "../lib/execution.api";

const STATUS_CLASSES: Record<NodeStatus, string> = {
  success: "text-emerald-400 border-emerald-800 bg-emerald-950/40",
  failed: "text-red-400 border-red-800 bg-red-950/40",
  skipped: "text-slate-400 border-slate-700 bg-slate-800/40",
};

function formatValue(value: unknown): string {
  if (value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function TestResultsPanel({
  result,
  onClose,
}: {
  result: TestRunResult;
  onClose: () => void;
}) {
  return (
    <div className="max-h-64 overflow-y-auto border-t border-slate-800 bg-slate-900 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">
          Run result:{" "}
          <span className={result.status === "success" ? "text-emerald-400" : "text-red-400"}>
            {result.status}
          </span>
        </p>
        <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300">
          Close
        </button>
      </div>

      <div className="space-y-2">
        {result.results.map((r) => {
          const def = getNodeTypeDef(r.type);
          return (
            <div
              key={r.nodeId}
              className={`border rounded-md px-3 py-2 text-xs ${STATUS_CLASSES[r.status]}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{def.label}</span>
                <span>
                  {r.status}
                  {r.durationMs > 0 ? ` · ${r.durationMs}ms` : ""}
                </span>
              </div>
              {r.error && <p className="mt-1 text-red-300">{r.error}</p>}
              {r.output !== undefined && (
                <pre className="mt-1 whitespace-pre-wrap text-slate-400">
                  {formatValue(r.output)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TestResultsPanel;
