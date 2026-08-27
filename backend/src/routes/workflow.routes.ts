import { Router } from "express";
import { getWorkflow, updateWorkflow, deleteWorkflow } from "../controllers/workflow.controller";
import { getGraph, saveGraph } from "../controllers/graph.controller";
import { testWorkflow } from "../controllers/execution.controller";
import { startExecution, listExecutions } from "../controllers/execution-async.controller";
import { listTriggers } from "../controllers/trigger.controller";
import { listCredentialsForWorkflow } from "../controllers/credentials.controller";

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

// Phase 7: trigger info (webhook URLs, schedule config) for the editor's config panel.
router.get("/:id/triggers", listTriggers);

// Phase 8: credentials available to this workflow's node config panel.
router.get("/:id/credentials", listCredentialsForWorkflow);

export default router;
