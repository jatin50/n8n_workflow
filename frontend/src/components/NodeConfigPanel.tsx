import { useState } from "react";
import { getNodeTypeDef, type NodeConfig } from "../nodes/nodeTypes";

interface Props {
  nodeType: string;
  configuration: NodeConfig;
  onChange: (configuration: NodeConfig) => void;
  onDelete: () => void;
  onClose: () => void;
  webhookUrl?: string | null;
}

function NodeConfigPanel({
  nodeType,
  configuration,
  onChange,
  onDelete,
  onClose,
  webhookUrl,
}: Props) {
  const def = getNodeTypeDef(nodeType);
  const [copied, setCopied] = useState(false);

  function set(key: string, value: string) {
    onChange({ ...configuration, [key]: value });
  }

  async function copyWebhookUrl() {
    if (!webhookUrl) return;
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="w-72 shrink-0 border-l border-slate-800 bg-slate-900/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">{def.label}</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm">
          Close
        </button>
      </div>

      {def.type === "trigger.manual" && (
        <p className="text-sm text-slate-500">This node has no configuration.</p>
      )}

      {def.type === "trigger.webhook" && (
        <div className="space-y-2">
          {webhookUrl ? (
            <>
              <label className="text-xs text-slate-400">Webhook URL</label>
              <div className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-300 break-all">
                {webhookUrl}
              </div>
              <button
                onClick={copyWebhookUrl}
                className="text-xs text-indigo-400 hover:underline"
              >
                {copied ? "Copied!" : "Copy URL"}
              </button>
              <p className="text-xs text-slate-500 pt-1">
                POST anything to this URL to run the workflow. The body is available to
                downstream nodes as this node's output.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Save the workflow once to generate this node's webhook URL.
            </p>
          )}
        </div>
      )}

      {def.type === "trigger.schedule" && (
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Cron expression</label>
          <input
            value={(configuration.cron as string) ?? ""}
            onChange={(e) => set("cron", e.target.value)}
            placeholder="*/5 * * * *"
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm font-mono outline-none focus:border-slate-500"
          />
          <p className="text-xs text-slate-500">
            Standard 5-field cron. E.g. */5 * * * * = every 5 minutes, 0 9 * * * = daily at
            9am. Takes effect after you Save.
          </p>
        </div>
      )}

      {def.type === "http.request" && (
        <>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Method</label>
            <select
              value={(configuration.method as string) ?? "GET"}
              onChange={(e) => set("method", e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            >
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">URL</label>
            <input
              value={(configuration.url as string) ?? ""}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://api.example.com/..."
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </>
      )}

      {def.type === "logic.if" && (
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Condition</label>
          <input
            value={(configuration.condition as string) ?? ""}
            onChange={(e) => set("condition", e.target.value)}
            placeholder="e.g. input.status === 200"
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
          />
        </div>
      )}

      {def.type === "data.setVariable" && (
        <>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Key</label>
            <input
              value={(configuration.key as string) ?? ""}
              onChange={(e) => set("key", e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Value</label>
            <input
              value={(configuration.value as string) ?? ""}
              onChange={(e) => set("value", e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </>
      )}

      <button
        onClick={onDelete}
        className="text-sm text-red-400 hover:text-red-300 transition pt-2 border-t border-slate-800 w-full text-left"
      >
        Delete node
      </button>
    </div>
  );
}

export default NodeConfigPanel;
