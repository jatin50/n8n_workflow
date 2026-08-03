import { NODE_TYPES } from "../nodes/nodeTypes";

const ACCENT_DOT: Record<string, string> = {
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
};

function NodePalette() {
  function handleDragStart(e: React.DragEvent, nodeType: string) {
    e.dataTransfer.setData("application/workflow-node-type", nodeType);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div className="w-56 shrink-0 border-r border-slate-800 bg-slate-900/50 p-3 space-y-2">
      <p className="text-xs uppercase tracking-wide text-slate-500 px-1 mb-2">
        Drag onto canvas
      </p>
      {NODE_TYPES.map((n) => (
        <div
          key={n.type}
          draggable
          onDragStart={(e) => handleDragStart(e, n.type)}
          className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 cursor-grab active:cursor-grabbing hover:border-slate-500 transition"
        >
          <span className={`w-2 h-2 rounded-full ${ACCENT_DOT[n.color]}`} />
          <span className="text-sm text-slate-200">{n.label}</span>
        </div>
      ))}
    </div>
  );
}

export default NodePalette;
