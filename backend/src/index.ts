import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

// Phase 0: just prove the server is alive and configured.
// Real routes (auth, workspaces, workflows, ...) get added from Phase 2 onward,
// following docs/api.md.
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "n8n-clone-backend",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
