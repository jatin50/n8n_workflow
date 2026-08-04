import { NodeExecutor } from "../types";

const setVariable: NodeExecutor = async (config, _input, context) => {
  const key = config.key as string;
  const value = config.value;

  if (!key) {
    throw new Error("Set Variable node has no key configured");
  }

  context.variables[key] = value;
  return { [key]: value };
};

export default setVariable;
