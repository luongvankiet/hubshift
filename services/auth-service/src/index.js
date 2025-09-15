"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("@workspace/auth");
const node_1 = require("better-auth/node");
const dotenv_1 = __importDefault(require("dotenv"));
const envalid_1 = require("envalid");
const api_1 = require("@workspace/api");
dotenv_1.default.config();
(0, envalid_1.cleanEnv)(process.env, {
    API_GATEWAY_PORT: (0, envalid_1.port)(),
    DATABASE_URL: (0, envalid_1.str)(),
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-store-domain"],
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/me", (0, api_1.asyncHandler)(async (req, res) => {
    const session = await auth_1.auth.api.getSession({
        headers: (0, node_1.fromNodeHeaders)(req.headers),
    });
    console.log("session", session);
    return (0, api_1.sendSuccess)(res, session, "Session retrieved successfully");
}));
// Health check endpoint
app.get("/health", (req, res) => {
    const uptime = process.uptime();
    return (0, api_1.sendHealth)(res, "healthy", uptime, "1.0.0");
});
// Better-auth routes
// app.use("/api/auth", toNodeHandler(auth));
app.all("/{*splat}", (0, node_1.toNodeHandler)(auth_1.auth));
// Add error handling middleware (must be last)
app.use(api_1.notFoundHandler);
app.use(api_1.errorHandler);
const HOST = process.env.HOST ?? "localhost";
const PORT = process.env.AUTH_SERVICE_PORT
    ? Number(process.env.AUTH_SERVICE_PORT)
    : 6001;
const server = app.listen(PORT, HOST, () => {
    console.log(`Auth service is running at http://${HOST}:${PORT}`);
});
server.on("error", console.error);
