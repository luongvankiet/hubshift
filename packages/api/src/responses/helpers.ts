import { Response } from "express";
import {
  ApiSuccessResponse,
  PaginatedResponse,
  PaginationMeta,
  CreateResponse,
  UpdateResponse,
  DeleteResponse,
  HealthCheckResponse,
} from "./types.js";

export class ResponseHelper {
  private res: Response;
  private requestId?: string;

  constructor(res: Response, requestId?: string) {
    this.res = res;
    this.requestId = requestId;
  }

  private createMeta() {
    return {
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
    };
  }

  /**
   * Send a successful response with data
   */
  success<T>(data: T, message?: string, statusCode: number = 200): Response {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      message,
      meta: this.createMeta(),
    };

    return this.res.status(statusCode).json(response);
  }

  /**
   * Send a paginated response
   */
  paginated<T>(
    items: T[],
    pagination: PaginationMeta,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: PaginatedResponse<T> = {
      success: true,
      data: items,
      message,
      pagination,
      meta: this.createMeta(),
    };

    return this.res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201)
   */
  created<T>(id: string | number, data: T, message?: string): Response {
    const response: CreateResponse<T> = {
      id,
      data,
      message: message || "Resource created successfully",
    };

    return this.res.status(201).json({
      success: true,
      data: response,
      meta: this.createMeta(),
    });
  }

  /**
   * Send an updated response (200)
   */
  updated<T>(data: T, message?: string): Response {
    const response: UpdateResponse<T> = {
      data,
      message: message || "Resource updated successfully",
    };

    return this.res.status(200).json({
      success: true,
      data: response,
      meta: this.createMeta(),
    });
  }

  /**
   * Send a deleted response (200)
   */
  deleted(id: string | number, message?: string): Response {
    const response: DeleteResponse = {
      id,
      message: message || "Resource deleted successfully",
    };

    return this.res.status(200).json({
      success: true,
      data: response,
      meta: this.createMeta(),
    });
  }

  /**
   * Send a no content response (204)
   */
  noContent(): Response {
    return this.res.status(204).send();
  }

  /**
   * Send a health check response
   */
  health(
    status: "healthy" | "unhealthy",
    uptime: number,
    version?: string,
    services?: Record<string, "healthy" | "unhealthy">
  ): Response {
    const response: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      version,
      services,
    };

    const statusCode = status === "healthy" ? 200 : 503;
    return this.res.status(statusCode).json(response);
  }
}

// Utility functions for creating pagination metadata
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Factory function to create a response helper
export function createResponseHelper(
  res: Response,
  requestId?: string
): ResponseHelper {
  return new ResponseHelper(res, requestId);
}

// Standalone helper functions for quick responses
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  return createResponseHelper(res).success(data, message, statusCode);
};

export const sendCreated = <T>(
  res: Response,
  id: string | number,
  data: T,
  message?: string
): Response => {
  return createResponseHelper(res).created(id, data, message);
};

export const sendUpdated = <T>(
  res: Response,
  data: T,
  message?: string
): Response => {
  return createResponseHelper(res).updated(data, message);
};

export const sendDeleted = (
  res: Response,
  id: string | number,
  message?: string
): Response => {
  return createResponseHelper(res).deleted(id, message);
};

export const sendPaginated = <T>(
  res: Response,
  items: T[],
  pagination: PaginationMeta,
  message?: string
): Response => {
  return createResponseHelper(res).paginated(items, pagination, message);
};

export const sendNoContent = (res: Response): Response => {
  return createResponseHelper(res).noContent();
};

export const sendHealth = (
  res: Response,
  status: "healthy" | "unhealthy",
  uptime: number,
  version?: string,
  services?: Record<string, "healthy" | "unhealthy">
): Response => {
  return createResponseHelper(res).health(status, uptime, version, services);
};
