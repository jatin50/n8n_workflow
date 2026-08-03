import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getNodeTypeDef, type NodeConfig } from "../nodes/nodeTypes";

// Tailwind needs full literal class strings to detect them at build time —
// a dynamic `bg-${color}-500` template string would be invisible to its
// scanner, so every color variant is spelled out here instead.
const ACCENT_CLASSES: Record<string, { border: string; dot: string }> = {
  emerald: { border: "border-emerald-600", dot: "bg-emerald-500" },
  indigo: { border: "border-indigo-600", dot: "bg-indigo-500" },
  amber: { border: "border-amber-600", dot: "bg-amber-500" },
  sky: { border: "border-sky-600", dot: "bg-sky-500" },
};

export interface WorkflowNodeData {
  nodeType: string;
  configuration: NodeConfig;
  [key: string]: unknown;
}

function WorkflowNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as WorkflowNodeData;
  const def = getNodeTypeDef(nodeData.nodeType);
  const accent = ACCENT_CLASSES[def.color] ?? ACCENT_CLASSES.indigo;

  return (
    <div
      className={`min-w-45 rounded-lg bg-slate-900 border-2 ${
        selected ? "border-white" : accent.border
      } px-3 py-2 shadow-lg`}
    >
      {def.hasInput && (
        <Handle type="target" position={Position.Left} className="bg-slate-500!" />
      )}

      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
        <span className="text-sm font-medium text-slate-100">{def.label}</span>
      </div>
      <p className="text-xs text-slate-400 mt-1 truncate max-w-40">
        {def.summarize(nodeData.configuration ?? {})}
      </p>

      <Handle type="source" position={Position.Right} className="bg-slate-500!" />
    </div>
  );
}

export default memo(WorkflowNode);
