import { Router } from "express";
import { getWorkflow, updateWorkflow, deleteWorkflow } from "../controllers/workflow.controller";
import { getGraph, saveGraph } from "../controllers/graph.controller";

const router = Router();

router.get("/:id", getWorkflow);
router.patch("/:id", updateWorkflow);
router.delete("/:id", deleteWorkflow);

// Phase 4: the visual editor's canvas state (nodes + connections).
router.get("/:id/graph", getGraph);
router.put("/:id/graph", saveGraph);

export default router;
