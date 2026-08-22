import { NodeExecutor } from "../types";

// This only runs when the node is executed WITHOUT a real webhook payload
// (e.g. clicking "Test workflow" in the editor) — an actual webhook call
// supplies its own output via the engine's triggerOverrides instead.
const webhookTrigger: NodeExecutor = async () => {
  return { source: "webhook", note: "Sample payload — no real webhook call received yet" };
};

export default webhookTrigger;
