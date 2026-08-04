import { NodeExecutor } from "../types";

// SECURITY NOTE: this evaluates the workflow author's own condition string
// as JavaScript via `new Function`. That's safe only because a workflow's
// nodes are always authored by the workspace's own owner (same trust
// boundary as the rest of their workflow) — this must NEVER be used to
// evaluate untrusted input from someone other than the workflow's owner.
// n8n itself takes the same approach for its expression editor.
const ifNode: NodeExecutor = async (config, input, context) => {
  const condition = (config.condition as string) || "";

  if (!condition.trim()) {
    return { result: false, input };
  }

  try {
    const evaluate = new Function(
      "input",
      "variables",
      `"use strict"; return (${condition});`
    );
    const result = Boolean(evaluate(input, context.variables));
    return { result, input };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Condition failed to evaluate: ${message}`);
  }
};

export default ifNode;
