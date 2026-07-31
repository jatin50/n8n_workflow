import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import workspaceRoutes from "./routes/workspace.routes";
import workflowRoutes from "./routes/workflow.routes";
import { authenticate } from "./middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "n8n-clone-backend",
    timestamp: new Date().toISOString(),
  });
});

// Phase 2: authentication (public routes).
app.use("/api/auth", authRoutes);

// Phase 3: workspaces & workflows (CRUD only, no execution yet).
// Everything below this line requires a valid access token.
app.use("/api/workspaces", authenticate, workspaceRoutes);
app.use("/api/workflows", authenticate, workflowRoutes);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
