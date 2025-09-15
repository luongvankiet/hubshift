import { ApiErrorResponse } from "../errors/types.js";

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T = any> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ListResponse<T = any> {
  items: T[];
  count: number;
}

export interface CreateResponse<T = any> {
  id: string | number;
  data: T;
  message?: string;
}

export interface UpdateResponse<T = any> {
  data: T;
  message?: string;
}

export interface DeleteResponse {
  id: string | number;
  message?: string;
}

// Health check response
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  version?: string;
  services?: Record<string, "healthy" | "unhealthy">;
}
