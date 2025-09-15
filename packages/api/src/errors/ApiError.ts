import { ErrorCode, ErrorDetails, HTTP_STATUS_CODES } from "./types.js";

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: ErrorDetails[];
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    details?: ErrorDetails[],
    isOperational: boolean = true
  ) {
    super(message);

    this.name = "ApiError";
    this.code = code;
    this.statusCode = HTTP_STATUS_CODES[code];
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
      },
    };
  }
}

// Specific error classes for common scenarios
export class ValidationError extends ApiError {
  constructor(message: string = "Validation failed", details?: ErrorDetails[]) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(ErrorCode.AUTHENTICATION_ERROR, message);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Insufficient permissions") {
    super(ErrorCode.AUTHORIZATION_ERROR, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = "Resource") {
    super(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Resource already exists") {
    super(ErrorCode.DUPLICATE_RESOURCE, message);
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, message?: string) {
    super(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      message || `External service ${service} is unavailable`
    );
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = "Too many requests") {
    super(ErrorCode.TOO_MANY_REQUESTS, message);
  }
}
