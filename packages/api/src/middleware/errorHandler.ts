import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError.js";
import { ErrorCode, ApiErrorResponse } from "../errors/types.js";
import { ZodError } from "zod";

export interface ErrorHandlerOptions {
  includeStackTrace?: boolean;
  logErrors?: boolean;
  logger?: (error: Error, req: Request) => void;
}

const defaultLogger = (error: Error, req: Request) => {
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.path}:`,
    error
  );
};

export function createErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    includeStackTrace = process.env.NODE_ENV === "development",
    logErrors = true,
    logger = defaultLogger,
  } = options;

  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    // Log the error if logging is enabled
    if (logErrors) {
      logger(error, req);
    }

    // Handle different types of errors
    let apiError: ApiError;

    if (error instanceof ApiError) {
      apiError = error;
    } else if (error instanceof ZodError) {
      // Handle Zod validation errors
      const details = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
        value: (err as any).received || undefined,
      }));

      apiError = new ApiError(
        ErrorCode.VALIDATION_ERROR,
        "Validation failed",
        details
      );
    } else if (error.name === "ValidationError") {
      // Handle other validation errors (e.g., Mongoose)
      apiError = new ApiError(ErrorCode.VALIDATION_ERROR, error.message);
    } else if (error.name === "CastError") {
      // Handle database cast errors
      apiError = new ApiError(ErrorCode.BAD_REQUEST, "Invalid data format");
    } else if (error.name === "MongoError" && (error as any).code === 11000) {
      // Handle MongoDB duplicate key errors
      apiError = new ApiError(
        ErrorCode.DUPLICATE_RESOURCE,
        "Resource already exists"
      );
    } else if (error.name === "JsonWebTokenError") {
      // Handle JWT errors
      apiError = new ApiError(ErrorCode.AUTHENTICATION_ERROR, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      // Handle expired JWT tokens
      apiError = new ApiError(ErrorCode.AUTHENTICATION_ERROR, "Token expired");
    } else {
      // Handle unknown errors
      apiError = new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
        undefined,
        false // Mark as non-operational
      );
    }

    // Create the error response
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: apiError.code,
        message: apiError.message,
        details: apiError.details,
        timestamp: apiError.timestamp,
        path: req.path,
        requestId: req.headers["x-request-id"] as string,
      },
    };

    // Include stack trace in development
    if (includeStackTrace && !apiError.isOperational) {
      (errorResponse.error as any).stack = error.stack;
    }

    // Send the error response
    res.status(apiError.statusCode).json(errorResponse);
  };
}

// Default error handler instance
export const errorHandler = createErrorHandler();

// Async error wrapper for route handlers
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Not found handler
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = new ApiError(
    ErrorCode.NOT_FOUND,
    `Route ${req.method} ${req.path} not found`
  );
  next(error);
}
