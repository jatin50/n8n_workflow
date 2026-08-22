import { NodeExecutor } from "../types";

const scheduleTrigger: NodeExecutor = async () => {
  return { source: "schedule", triggeredAt: new Date().toISOString() };
};

export default scheduleTrigger;
