import { Router } from "express";
import {
    listWorkspaces,
    createWorkspace,
    getWorkspace,
    updateWorkspace,
    deleteWorkspace,
} from "../controllers/workspace.controller";
import { listWorkflows, createWorkflow } from "../controllers/workflow.controller";
import { listCredentials, createCredential } from "../controllers/credentials.controller";

const router = Router();

router.get("/", listWorkspaces);
router.post("/", createWorkspace);
router.get("/:id", getWorkspace);
router.patch("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

// Nested under a workspace since a workflow always belongs to exactly one.
router.get("/:workspaceId/workflows", listWorkflows);
router.post("/:workspaceId/workflows", createWorkflow);

// Phase 8: credentials also belong to exactly one workspace.
router.get("/:workspaceId/credentials", listCredentials);
router.post("/:workspaceId/credentials", createCredential);

export default router;
