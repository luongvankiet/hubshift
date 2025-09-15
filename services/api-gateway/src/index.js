"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
// import swaggerUi from 'swagger-ui-express';
// import axios from 'axios';
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const envalid_1 = require("envalid");
const proxy_1 = require("./utils/proxy");
dotenv_1.default.config();
(0, envalid_1.cleanEnv)(process.env, {
    API_GATEWAY_PORT: (0, envalid_1.port)(),
    DATABASE_URL: (0, envalid_1.str)(),
});
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.API_GATEWAY_PORT || 8080;
const app = (0, express_1.default)();
// const allowedOrigins = isProduction
//   ? [process.env.API_GATEWAY_URL!]
//   : ["http://localhost:3000", "http://localhost:3001"];
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-store-domain",
        "x-trpc-source",
        "*",
    ],
}));
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
app.use((0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => (req.user ? 1000 : 100), // limit each IP to 100 requests per windowMs
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: true,
    keyGenerator: async (req) => {
        // Use API key (or some other identifier) for authenticated users
        if (req.query.apiKey)
            return String(req.query.apiKey);
        // fallback to IP for unauthenticated users
        // return req.ip // vulnerable
        return (0, express_rate_limit_1.ipKeyGenerator)(req.ip || ""); // better
    },
}));
app.set("trust proxy", 1);
app.get("/gateway-health", (req, res) => {
    res.send({ message: "Welcome to api-gateway!" });
});
// Auth service
app.use("/", (0, proxy_1.createProxyMiddleware)((0, proxy_1.getServiceUrl)("auth", 6001)));
// Catalog service
// app.use("/api/test", proxy("http://localhost:6003"));
// app.use("/api/catalog", proxy("http://localhost:6002"));
const server = app.listen(PORT, () => {
    console.log(`API Gateway is running at http://localhost:${PORT}`);
});
server.on("error", console.error);
