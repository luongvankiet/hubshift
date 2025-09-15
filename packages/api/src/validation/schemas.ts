import { z } from "zod";

// Common field validations
export const emailSchema = z.string().email("Invalid email format");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format");

export const urlSchema = z.string().url("Invalid URL format");

// ID validations
export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const numericIdSchema = z
  .string()
  .regex(/^\d+$/, "ID must be numeric")
  .transform(Number);

// Pagination schemas
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .refine((val) => val > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Search schemas
export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  ...paginationQuerySchema.shape,
});

// Date range schemas
export const dateRangeSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }
  );

// File upload schemas
export const fileUploadSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  mimetype: z.string().min(1, "MIME type is required"),
  size: z.number().positive("File size must be positive"),
});

export const imageUploadSchema = fileUploadSchema.extend({
  mimetype: z.string().regex(/^image\//, "File must be an image"),
  size: z.number().max(5 * 1024 * 1024, "Image size must be less than 5MB"),
});

// Common request schemas
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: phoneSchema.optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ password: true });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Common parameter schemas
export const idParamSchema = z.object({
  id: mongoIdSchema,
});

export const slugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

// Header schemas
export const authHeaderSchema = z.object({
  authorization: z
    .string()
    .regex(/^Bearer .+/, "Authorization header must be in Bearer format"),
});

export const contentTypeHeaderSchema = z.object({
  "content-type": z.string().includes("application/json"),
});
