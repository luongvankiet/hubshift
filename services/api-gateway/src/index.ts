import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
// import swaggerUi from 'swagger-ui-express';
// import axios from 'axios';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { cleanEnv, str, port } from "envalid";
import { createProxyMiddleware, getServiceUrl } from "./utils/proxy.js";

dotenv.config();

cleanEnv(process.env, {
  API_GATEWAY_PORT: port(),
  DATABASE_URL: str(),
});

const isProduction = process.env.NODE_ENV === "production";

const PORT = process.env.API_GATEWAY_PORT || 8080;

const app = express();

// const allowedOrigins = isProduction
//   ? [process.env.API_GATEWAY_URL!]
//   : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-store-domain",
      "x-trpc-source",
      "*",
    ],
  })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req: any) => (req.user ? 1000 : 100), // limit each IP to 100 requests per windowMs
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: true,

    keyGenerator: async (req: any) => {
      // Use API key (or some other identifier) for authenticated users
      if (req.query.apiKey) return String(req.query.apiKey);

      // fallback to IP for unauthenticated users
      // return req.ip // vulnerable
      return ipKeyGenerator(req.ip || ""); // better
    },
  }) as any
);

app.set("trust proxy", 1);

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

// Auth service
app.use("/", createProxyMiddleware(getServiceUrl("auth", 6001)));

// Catalog service
// app.use("/api/test", proxy("http://localhost:6003"));
// app.use("/api/catalog", proxy("http://localhost:6002"));

const server = app.listen(PORT, () => {
  console.log(`API Gateway is running at http://localhost:${PORT}`);
});
server.on("error", console.error);
