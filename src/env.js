import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: z.string().url(),
    NEXT_PUBLIC_POLL_INTERVAL_MS: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1000)),
    NEXT_PUBLIC_DEBOUNCE_DELAY_MS: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(100)),
    // Optional sensor range configurations with defaults
    NEXT_PUBLIC_DEFAULT_MIN_CO2: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).optional(),
    NEXT_PUBLIC_DEFAULT_MAX_CO2: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).optional(),
    NEXT_PUBLIC_DEFAULT_MIN_TEMP: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).optional(),
    NEXT_PUBLIC_DEFAULT_MAX_TEMP: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).optional(),
    NEXT_PUBLIC_DEFAULT_MIN_HUMIDITY: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).optional(),
    NEXT_PUBLIC_DEFAULT_MAX_HUMIDITY: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    NEXT_PUBLIC_POLL_INTERVAL_MS: process.env.NEXT_PUBLIC_POLL_INTERVAL_MS,
    NEXT_PUBLIC_DEBOUNCE_DELAY_MS: process.env.NEXT_PUBLIC_DEBOUNCE_DELAY_MS,
    NEXT_PUBLIC_DEFAULT_MIN_CO2: process.env.NEXT_PUBLIC_DEFAULT_MIN_CO2,
    NEXT_PUBLIC_DEFAULT_MAX_CO2: process.env.NEXT_PUBLIC_DEFAULT_MAX_CO2,
    NEXT_PUBLIC_DEFAULT_MIN_TEMP: process.env.NEXT_PUBLIC_DEFAULT_MIN_TEMP,
    NEXT_PUBLIC_DEFAULT_MAX_TEMP: process.env.NEXT_PUBLIC_DEFAULT_MAX_TEMP,
    NEXT_PUBLIC_DEFAULT_MIN_HUMIDITY: process.env.NEXT_PUBLIC_DEFAULT_MIN_HUMIDITY,
    NEXT_PUBLIC_DEFAULT_MAX_HUMIDITY: process.env.NEXT_PUBLIC_DEFAULT_MAX_HUMIDITY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
