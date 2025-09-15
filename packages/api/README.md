# @workspace/api

A comprehensive API utilities package for handling responses, errors, and validation in Express.js applications.

## Features

- 🚨 **Standardized Error Handling**: Custom error classes with consistent error responses
- ✅ **Response Helpers**: Utility functions for consistent API responses
- 🔍 **Request Validation**: Zod-based validation middleware and utilities
- 🛡️ **Error Middleware**: Express middleware for centralized error handling
- 📄 **TypeScript Support**: Full TypeScript support with comprehensive types

## Installation

This package is part of the workspace and should be installed via the workspace:

```bash
pnpm add @workspace/api
```

## Quick Start

### Basic Setup

```typescript
import express from "express";
import { errorHandler, notFoundHandler } from "@workspace/api";

const app = express();

app.use(express.json());

// Your routes here...

// Add the not found handler before error handler
app.use(notFoundHandler);

// Add the error handler as the last middleware
app.use(errorHandler);

app.listen(3000);
```

### Using Response Helpers

```typescript
import { Request, Response } from "express";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  createPaginationMeta,
} from "@workspace/api";

// Simple success response
app.get("/users/:id", async (req: Request, res: Response) => {
  const user = await getUserById(req.params.id);
  return sendSuccess(res, user, "User retrieved successfully");
});

// Created response
app.post("/users", async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  return sendCreated(res, user.id, user, "User created successfully");
});

// Paginated response
app.get("/users", async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const { users, total } = await getUsers(page, limit);
  const pagination = createPaginationMeta(page, limit, total);
  return sendPaginated(res, users, pagination);
});
```

### Error Handling

```typescript
import {
  ApiError,
  NotFoundError,
  ValidationError,
  asyncHandler,
} from "@workspace/api";

// Using specific error classes
app.get(
  "/users/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await getUserById(req.params.id);
    if (!user) {
      throw new NotFoundError("User");
    }
    return sendSuccess(res, user);
  })
);

// Using generic ApiError
app.post(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    if (await emailExists(req.body.email)) {
      throw new ApiError(ErrorCode.CONFLICT, "Email already exists");
    }
    const user = await createUser(req.body);
    return sendCreated(res, user.id, user);
  })
);
```

### Request Validation

```typescript
import { validate, createUserSchema, idParamSchema } from "@workspace/api";

// Validate request body
app.post(
  "/users",
  validate({ body: createUserSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    // req.body is now typed and validated
    const user = await createUser(req.body);
    return sendCreated(res, user.id, user);
  })
);

// Validate route parameters
app.get(
  "/users/:id",
  validate({ params: idParamSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    // req.params.id is validated as a MongoDB ObjectId
    const user = await getUserById(req.params.id);
    return sendSuccess(res, user);
  })
);
```

## API Reference

### Error Classes

- `ApiError`: Base error class for all API errors
- `ValidationError`: For validation failures
- `AuthenticationError`: For authentication failures
- `AuthorizationError`: For authorization failures
- `NotFoundError`: For resource not found errors
- `ConflictError`: For resource conflicts
- `ExternalServiceError`: For external service failures
- `RateLimitError`: For rate limiting errors

### Response Helpers

- `sendSuccess(res, data, message?, statusCode?)`: Send success response
- `sendCreated(res, id, data, message?)`: Send created response (201)
- `sendUpdated(res, data, message?)`: Send updated response
- `sendDeleted(res, id, message?)`: Send deleted response
- `sendPaginated(res, items, pagination, message?)`: Send paginated response
- `sendNoContent(res)`: Send no content response (204)
- `sendHealth(res, status, uptime, version?, services?)`: Send health check response

### Middleware

- `errorHandler`: Default error handling middleware
- `createErrorHandler(options)`: Create custom error handler
- `asyncHandler(fn)`: Wrapper for async route handlers
- `notFoundHandler`: 404 handler middleware

### Validation

- `validate(schemas)`: Validation middleware
- `validateValue(schema, value)`: Validate a single value
- `safeValidate(schema, value)`: Safe validation that returns result object

### Common Schemas

- `emailSchema`, `passwordSchema`, `phoneSchema`, `urlSchema`
- `mongoIdSchema`, `uuidSchema`, `numericIdSchema`
- `paginationQuerySchema`, `searchQuerySchema`, `dateRangeSchema`
- `createUserSchema`, `updateUserSchema`, `loginSchema`
- `idParamSchema`, `slugParamSchema`
- `authHeaderSchema`, `contentTypeHeaderSchema`

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "timestamp": "2023-01-01T00:00:00.000Z",
    "requestId": "optional-request-id"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error message",
        "code": "validation_code",
        "value": "invalid_value"
      }
    ],
    "timestamp": "2023-01-01T00:00:00.000Z",
    "path": "/api/endpoint",
    "requestId": "optional-request-id"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
}
```

## Usage in Services

### Auth Service Example

```typescript
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  sendSuccess,
  sendHealth,
  AuthenticationError,
} from "@workspace/api";

// Health check
app.get("/health", (req, res) => {
  const uptime = process.uptime();
  return sendHealth(res, "healthy", uptime, "1.0.0");
});

// Session endpoint
app.get(
  "/me",
  asyncHandler(async (req, res) => {
    const session = await getSession(req);
    return sendSuccess(res, session, "Session retrieved successfully");
  })
);

// Add error handling
app.use(notFoundHandler);
app.use(errorHandler);
```

### API Gateway Example

```typescript
import { errorHandler, sendSuccess } from "@workspace/api";

app.get("/gateway-health", (req, res) => {
  return sendSuccess(res, {
    message: "API Gateway is running",
    services: {
      auth: "healthy",
      catalog: "healthy",
    },
  });
});

app.use(errorHandler);
```

## Error Codes

The package includes predefined error codes that map to HTTP status codes:

- `BAD_REQUEST` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `METHOD_NOT_ALLOWED` (405)
- `CONFLICT` (409)
- `UNPROCESSABLE_ENTITY` (422)
- `TOO_MANY_REQUESTS` (429)
- `INTERNAL_SERVER_ERROR` (500)
- `NOT_IMPLEMENTED` (501)
- `BAD_GATEWAY` (502)
- `SERVICE_UNAVAILABLE` (503)
- `GATEWAY_TIMEOUT` (504)

And custom business logic codes:

- `VALIDATION_ERROR`
- `AUTHENTICATION_ERROR`
- `AUTHORIZATION_ERROR`
- `RESOURCE_NOT_FOUND`
- `DUPLICATE_RESOURCE`
- `EXTERNAL_SERVICE_ERROR`

## Development

### Building

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Watching for Changes

```bash
pnpm dev
```

## License

MIT
