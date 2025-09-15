"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceUrl = exports.createProxyMiddleware = void 0;
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const createProxyMiddleware = (serviceUrl) => {
    return (0, express_http_proxy_1.default)(serviceUrl, {
        timeout: 30000,
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            proxyReqOpts.headers["X-Forwarded-For"] = srcReq.ip;
            proxyReqOpts.headers["X-Original-Host"] = srcReq.get("host");
            return proxyReqOpts;
        },
        proxyErrorHandler: (err, res, next) => {
            console.error(`Error proxying to ${serviceUrl}:`, err?.message);
            if (!res.headersSent) {
                res.status(503).json({
                    success: false,
                    error: {
                        code: "SERVICE_UNAVAILABLE",
                        message: "Service temporarily unavailable",
                        service: serviceUrl,
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            next(err);
        },
    });
};
exports.createProxyMiddleware = createProxyMiddleware;
const getServiceUrl = (serviceName, port) => {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
        return `http://${serviceName}.kevin-luong.com`;
    }
    return `http://localhost:${port}`;
};
exports.getServiceUrl = getServiceUrl;
