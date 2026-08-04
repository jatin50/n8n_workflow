import { NodeExecutor } from "../types";

// A trigger has nothing to compute — it just produces an empty payload
// that downstream nodes can build on.
const manualTrigger: NodeExecutor = async () => {
  return { triggeredAt: new Date().toISOString() };
};

export default manualTrigger;
