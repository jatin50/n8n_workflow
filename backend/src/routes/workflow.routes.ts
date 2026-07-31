import { Router } from "express";
import { getWorkflow, updateWorkflow, deleteWorkflow } from "../controllers/workflow.controller";

const router = Router();

router.get("/:id", getWorkflow);
router.patch("/:id", updateWorkflow);
router.delete("/:id", deleteWorkflow);

export default router;
