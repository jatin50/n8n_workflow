import { Router } from "express";
import { getWorkflow, updateWorkflow, deleteWorkflow } from "../controllers/workflow.controller";
import { getGraph, saveGraph } from "../controllers/graph.controller";
import { testWorkflow } from "../controllers/execution.controller";
import { startExecution, listExecutions } from "../controllers/execution-async.controller";

const router = Router();

router.get("/:id", getWorkflow);
router.patch("/:id", updateWorkflow);
router.delete("/:id", deleteWorkflow);

// Phase 4: the visual editor's canvas state (nodes + connections).
router.get("/:id/graph", getGraph);
router.put("/:id/graph", saveGraph);

// Phase 5: synchronous test-run of the node engine (no queue yet).
router.post("/:id/test", testWorkflow);

// Phase 6: async execution via the BullMQ queue.
router.post("/:id/executions", startExecution);
router.get("/:id/executions", listExecutions);

export default router;
