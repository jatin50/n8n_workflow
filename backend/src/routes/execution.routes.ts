import { Router } from "express";
import { getExecution, getExecutionLogs } from "../controllers/execution-async.controller";

const router = Router();

router.get("/:id", getExecution);
router.get("/:id/logs", getExecutionLogs);

export default router;
