import { getExecutor } from "./executors";
import {
  EngineNode,
  EngineConnection,
  ExecutionContext,
  NodeExecutionResult,
} from "./types";

// Kahn's algorithm — produces a run order where every node comes after all
// of its upstream dependencies, and throws if the graph has a cycle
// (a workflow can't meaningfully "run" if A depends on B depends on A).
function topologicalSort(nodes: EngineNode[], connections: EngineConnection[]): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const conn of connections) {
    if (!adjacency.has(conn.sourceNode) || !inDegree.has(conn.targetNode)) continue;
    adjacency.get(conn.sourceNode)!.push(conn.targetNode);
    inDegree.set(conn.targetNode, (inDegree.get(conn.targetNode) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const next of adjacency.get(current) ?? []) {
      inDegree.set(next, inDegree.get(next)! - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    }
  }

  if (order.length !== nodes.length) {
    throw new Error("Workflow contains a cycle and cannot be executed");
  }

  return order;
}

export async function runWorkflowTest(
  nodes: EngineNode[],
  connections: EngineConnection[],
  triggerOverrides?: Record<string, unknown>
): Promise<{ status: "success" | "failed"; results: NodeExecutionResult[] }> {
  const order = topologicalSort(nodes, connections);
  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const outputs = new Map<string, unknown>();
  const failedOrSkipped = new Set<string>();
  const results: NodeExecutionResult[] = [];
  const context: ExecutionContext = { variables: {} };

  // For each node, which other nodes feed into it directly.
  const incomingBySource = new Map<string, string[]>();
  for (const conn of connections) {
    if (!incomingBySource.has(conn.targetNode)) incomingBySource.set(conn.targetNode, []);
    incomingBySource.get(conn.targetNode)!.push(conn.sourceNode);
  }

  let overallStatus: "success" | "failed" = "success";

  for (const nodeId of order) {
    const node = nodesById.get(nodeId)!;
    const upstreamIds = incomingBySource.get(nodeId) ?? [];
    const upstreamFailed = upstreamIds.some((id) => failedOrSkipped.has(id));

    if (upstreamFailed) {
      failedOrSkipped.add(nodeId);
      results.push({ nodeId, type: node.type, status: "skipped", durationMs: 0 });
      continue;
    }

    // Single upstream -> pass its output directly. Multiple -> pass an
    // array of outputs, in connection order, so a node can fan-in.
    const input =
      upstreamIds.length === 0
        ? null
        : upstreamIds.length === 1
          ? outputs.get(upstreamIds[0])
          : upstreamIds.map((id) => outputs.get(id));

    const startedAt = Date.now();
    try {
      // A webhook/schedule trigger's real payload takes priority over its
      // executor's generic stub output — this is how external data (a
      // webhook's request body, a schedule tick's timestamp) actually
      // enters the graph.
      const hasOverride = triggerOverrides && nodeId in triggerOverrides;
      const output = hasOverride
        ? triggerOverrides![nodeId]
        : await getExecutor(node.type)(node.configuration, input, context);

      outputs.set(nodeId, output);
      results.push({
        nodeId,
        type: node.type,
        status: "success",
        output,
        durationMs: Date.now() - startedAt,
      });
    } catch (err) {
      failedOrSkipped.add(nodeId);
      overallStatus = "failed";
      results.push({
        nodeId,
        type: node.type,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
        durationMs: Date.now() - startedAt,
      });
    }
  }

  return { status: overallStatus, results };
}
