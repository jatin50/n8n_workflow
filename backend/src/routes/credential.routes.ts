import { Router } from "express";
import { updateCredential, deleteCredential } from "../controllers/credentials.controller";

const router = Router();

router.patch("/:id", updateCredential);
router.delete("/:id", deleteCredential);

export default router;
