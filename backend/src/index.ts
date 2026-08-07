import "dotenv/config";
import dns from "node:dns";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import workspaceRoutes from "./routes/workspace.routes";
import workflowRoutes from "./routes/workflow.routes";
import executionRoutes from "./routes/execution.routes";
import { authenticate } from "./middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Node's fetch tries IPv6 first by default. On networks with broken/slow
// IPv6 routing (common on some home routers), this causes HTTP Request
// nodes to hang until they time out even though the URL is fine —
// forcing IPv4-first resolution fixes it.
dns.setDefaultResultOrder("ipv4first");

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
app.use("/api/executions", authenticate, executionRoutes);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
