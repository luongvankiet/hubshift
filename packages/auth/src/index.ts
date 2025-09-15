import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@workspace/db/client";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
}) {
  const config = {
    database: mongodbAdapter(db),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      oAuthProxy({
        /**
         * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
         */
        currentURL: options.baseUrl,
        productionURL: options.productionUrl,
      }),
      expo(),
    ],
    socialProviders: {},
    trustedOrigins: ["expo://", "*"],
    emailAndPassword: {
      enabled: true,
    },
  };

  return betterAuth(config as BetterAuthOptions);
}

export const auth = initAuth({
  baseUrl: process.env.API_GATEWAY_URL!,
  productionUrl: process.env.API_GATEWAY_URL!,
  secret: process.env.BETTER_AUTH_SECRET,
});

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
