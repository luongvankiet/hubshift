/**
 * Centralized route constants for the application
 * This file contains all route paths used throughout the app
 * to maintain consistency and enable easy updates
 */

export const ROUTES = {
  // Public routes
  HOME: "/",

  // Auth routes
  AUTH: {
    SIGN_IN: "/auth/sign-in",
    SIGN_UP: "/auth/sign-up",
  },

  // Dashboard routes
  DASHBOARD: {
    ROOT: "/dashboard",
    TASKS: "/tasks",
    APPS: "/apps",
    CHATS: "/chats",
    USERS: "/users",
  },

  // Clerk routes (if using Clerk)
  CLERK: {
    SIGN_IN: "/clerk/sign-in",
    SIGN_UP: "/clerk/sign-up",
    USER_MANAGEMENT: "/clerk/user-management",
  },

  // Other routes
  CALCULATOR: "/calculator",
} as const;

// Type helper for route values
export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];

// Helper function to get nested route values
export const getRoute = (path: string): string => {
  const keys = path.split(".");
  let result: any = ROUTES;

  for (const key of keys) {
    result = result[key];
    if (result === undefined) {
      throw new Error(`Route path "${path}" not found`);
    }
  }

  return result;
};
