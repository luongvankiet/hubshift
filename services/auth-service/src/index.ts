import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import { auth } from "@workspace/auth";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import dotenv from "dotenv";
import { cleanEnv, str, port } from "envalid";
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  sendSuccess,
  sendHealth,
} from "@workspace/api";
dotenv.config();

cleanEnv(process.env, {
  API_GATEWAY_PORT: port(),
  DATABASE_URL: str(),
});

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-store-domain"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    console.log("session", session);
    return sendSuccess(res, session, "Session retrieved successfully");
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  const uptime = process.uptime();
  return sendHealth(res, "healthy", uptime, "1.0.0");
});

// Better-auth routes
app.all("/{*splat}", toNodeHandler(auth));

// Add error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const HOST = process.env.HOST ?? "localhost";
const PORT = process.env.AUTH_SERVICE_PORT
  ? Number(process.env.AUTH_SERVICE_PORT)
  : 6001;
const server = app.listen(PORT, HOST, () => {
  console.log(`Auth service is running at http://${HOST}:${PORT}`);
});

server.on("error", console.error);
