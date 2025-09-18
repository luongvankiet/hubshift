import proxy from "express-http-proxy";
import { RequestHandler } from "express";

export const createProxyMiddleware: (serviceUrl: string) => RequestHandler = (
  serviceUrl: string
) => {
  return proxy(serviceUrl, {
    timeout: 30000,
    proxyReqOptDecorator: (
      proxyReqOpts: { headers: any },
      srcReq: { ip: any; get: (arg: string) => any }
    ) => {
      proxyReqOpts.headers["X-Forwarded-For"] = srcReq.ip;
      proxyReqOpts.headers["X-Original-Host"] = srcReq.get("host");
      return proxyReqOpts;
    },
    proxyErrorHandler: (
      err: { message: string },
      res: {
        headersSent: any;
        status: (arg: number) => any;
      },
      next: any
    ) => {
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

export const getServiceUrl = (serviceName: string, port: number) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return process.env.AUTH_SERVICE_URL;
  }
  return `http://localhost:${port}`;
};
