import { createAuthClient } from "better-auth/react";

const baseURL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:6001";

export const authClient = createAuthClient({
  baseURL,
}) as ReturnType<typeof createAuthClient>;

export type AuthClient = typeof authClient;
