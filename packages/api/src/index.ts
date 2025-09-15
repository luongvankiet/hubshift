// Error handling exports
export * from "./errors/types.js";
export * from "./errors/ApiError.js";

// Response handling exports
export * from "./responses/types.js";
export * from "./responses/helpers.js";

// Middleware exports
export * from "./middleware/errorHandler.js";

// Validation exports
export * from "./validation/index.js";
export * from "./validation/schemas.js";

// Re-export commonly used types and utilities
export type {
  ApiResponse,
  ApiSuccessResponse,
  PaginatedResponse,
  PaginationMeta,
} from "./responses/types.js";

export type { ApiErrorResponse, ErrorDetails } from "./errors/types.js";

export type { ErrorCode } from "./errors/types.js";

export {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ExternalServiceError,
  RateLimitError,
} from "./errors/ApiError.js";

export {
  errorHandler,
  createErrorHandler,
  asyncHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";

export {
  ResponseHelper,
  createResponseHelper,
  sendSuccess,
  sendCreated,
  sendUpdated,
  sendDeleted,
  sendPaginated,
  sendNoContent,
  sendHealth,
  createPaginationMeta,
} from "./responses/helpers.js";

export { validate, validateValue, safeValidate } from "./validation/index.js";
