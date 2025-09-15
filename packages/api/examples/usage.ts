import express from "express";
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validate,
  sendSuccess,
  sendCreated,
  sendPaginated,
  createPaginationMeta,
  ApiError,
  ErrorCode,
  NotFoundError,
  ValidationError,
  createUserSchema,
  idParamSchema,
  paginationQuerySchema,
} from "@workspace/api";

const app = express();

// Middleware setup
app.use(express.json());

// Example: Simple success response
app.get("/health", (req, res) => {
  return sendSuccess(res, { status: "healthy" }, "Service is running");
});

// Example: Using validation middleware
app.post(
  "/users",
  validate({ body: createUserSchema }),
  asyncHandler(async (req, res) => {
    // Simulate user creation
    const user = {
      id: "123",
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      createdAt: new Date().toISOString(),
    };

    return sendCreated(res, user.id, user, "User created successfully");
  })
);

// Example: Using parameter validation and error handling
app.get(
  "/users/:id",
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    // Simulate user lookup
    const userId = req.params.id;

    // Simulate user not found
    if (userId === "000000000000000000000000") {
      throw new NotFoundError("User");
    }

    const user = {
      id: userId,
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
    };

    return sendSuccess(res, user);
  })
);

// Example: Paginated response
app.get(
  "/users",
  validate({ query: paginationQuerySchema }),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query;

    // Simulate database query
    const users = Array.from({ length: limit }, (_, i) => ({
      id: `user-${page}-${i}`,
      email: `user${i}@example.com`,
      firstName: `User${i}`,
      lastName: "Doe",
    }));

    const total = 100; // Simulate total count
    const pagination = createPaginationMeta(page, limit, total);

    return sendPaginated(res, users, pagination);
  })
);

// Example: Custom error handling
app.post(
  "/users/:id/activate",
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Simulate business logic error
    const userIsAlreadyActive = true;
    if (userIsAlreadyActive) {
      throw new ApiError(ErrorCode.CONFLICT, "User is already active", [
        { field: "status", message: "User status is already active" },
      ]);
    }

    return sendSuccess(res, { message: "User activated" });
  })
);

// Example: Manual validation
app.post("/validate-email", (req, res) => {
  try {
    const { email } = req.body;

    // Manual validation using schemas
    const emailSchema = createUserSchema.pick({ email: true });
    const validatedData = emailSchema.parse({ email });

    return sendSuccess(res, { valid: true, email: validatedData.email });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ApiError(ErrorCode.BAD_REQUEST, "Invalid request");
  }
});

// Add error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Example API server running on port ${PORT}`);
});
