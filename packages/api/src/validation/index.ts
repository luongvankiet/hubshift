import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../errors/ApiError.js";
import { ErrorDetails } from "../errors/types.js";

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

/**
 * Middleware to validate request data using Zod schemas
 */
export function validate(schemas: ValidationOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ErrorDetails[] = [];

    // Validate body
    if (schemas.body) {
      try {
        req.body = schemas.body.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, "body"));
        }
      }
    }

    // Validate query parameters
    if (schemas.query) {
      try {
        req.query = schemas.query.parse(req.query);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, "query"));
        }
      }
    }

    // Validate route parameters
    if (schemas.params) {
      try {
        req.params = schemas.params.parse(req.params);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, "params"));
        }
      }
    }

    // Validate headers
    if (schemas.headers) {
      try {
        schemas.headers.parse(req.headers);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, "headers"));
        }
      }
    }

    // If there are validation errors, throw a ValidationError
    if (errors.length > 0) {
      throw new ValidationError("Request validation failed", errors);
    }

    next();
  };
}

/**
 * Format Zod errors into our ErrorDetails format
 */
function formatZodErrors(error: ZodError, source: string): ErrorDetails[] {
  return error.errors.map((err) => ({
    field: `${source}.${err.path.join(".")}`,
    message: err.message,
    code: err.code,
    value: (err as any).received || undefined,
  }));
}

/**
 * Validate a single value against a schema
 */
export function validateValue<T>(schema: ZodSchema<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
        value: (err as any).received || undefined,
      }));
      throw new ValidationError("Validation failed", details);
    }
    throw error;
  }
}

/**
 * Safe validation that returns a result object instead of throwing
 */
export function safeValidate<T>(
  schema: ZodSchema<T>,
  value: unknown
): { success: true; data: T } | { success: false; errors: ErrorDetails[] } {
  try {
    const data = schema.parse(value);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
        value: (err as any).received || undefined,
      }));
      return { success: false, errors };
    }
    return {
      success: false,
      errors: [{ message: "Unknown validation error" }],
    };
  }
}

// Common validation schemas
export * from "./schemas.js";
