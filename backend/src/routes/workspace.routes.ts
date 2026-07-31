import { Router } from "express";
import {
    listWorkspaces,
    createWorkspace,
    getWorkspace,
    updateWorkspace,
    deleteWorkspace,
} from "../controllers/workspace.controller";
import { listWorkflows, createWorkflow } from "../controllers/workflow.controller";

const router = Router();

router.get("/", listWorkspaces);
router.post("/", createWorkspace);
router.get("/:id", getWorkspace);
router.patch("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

// Nested under a workspace since a workflow always belongs to exactly one.
router.get("/:workspaceId/workflows", listWorkflows);
router.post("/:workspaceId/workflows", createWorkflow);

export default router;
