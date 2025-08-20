/**
 * Local development server for the API with Neon database support via Hyperdrive.
 *
 * @remarks
 * This file bootstraps a local Cloudflare Workers environment using Wrangler's
 * getPlatformProxy, allowing you to develop against a Neon database instance
 * locally with Hyperdrive bindings.
 *
 * Features:
 * - Emulates Cloudflare Workers runtime environment
 * - Provides access to Hyperdrive bindings for Neon PostgreSQL
 * - Connection pooling via Hyperdrive
 * - Hot reloading support for rapid development
 *
 * @example
 * Start the development server:
 * ```bash
 * bun --filter @repo/api dev
 * ```
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { getPlatformProxy } from "wrangler";
import api from "./index.js";
import { createAuth } from "./lib/auth.js";
import type { AppContext } from "./lib/context.js";
import { createDb } from "./lib/db.js";
import type { Env } from "./lib/env.js";

type CloudflareEnv = {
  HYPERDRIVE: Hyperdrive;
  HYPERDRIVE_DIRECT: Hyperdrive;
} & Env;

/**
 * Initialize the local development server with Cloudflare bindings.
 */
const app = new Hono<AppContext>();

/**
 * CORS middleware for local development
 */
app.use("*", cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  exposeHeaders: ["Content-Type", "Set-Cookie"]
}));

/**
 * Create a local Cloudflare environment proxy.
 *
 * @remarks
 * - Reads configuration from wrangler.jsonc in the parent directory
 * - Enables persistence to maintain D1 database state across restarts
 * - Provides access to all Cloudflare bindings defined in wrangler.jsonc
 * - Gracefully handles missing Hyperdrive bindings for local development
 */
let cf: Awaited<ReturnType<typeof getPlatformProxy<CloudflareEnv>>> | null = null;

try {
  cf = await getPlatformProxy<CloudflareEnv>({
    configPath: "../edge/wrangler.jsonc",
    persist: true,
  });
  console.log("[DEV] Cloudflare Workers environment initialized successfully");
} catch (error) {
  console.log("[DEV] Failed to initialize Cloudflare Workers environment, using direct database connection");
  console.log("[DEV] Error:", error instanceof Error ? error.message : String(error));
}

/**
 * Middleware to inject database binding into request context.
 *
 * @remarks
 * Uses Neon PostgreSQL via Hyperdrive for production deployment.
 * For local development, falls back to direct DATABASE_URL connection
 * when Hyperdrive bindings are not available.
 */
app.use("*", async (c, next) => {
  let db;
  
  // Check if Cloudflare Workers environment and Hyperdrive binding are available
  if (cf && cf.env.HYPERDRIVE) {
    console.log("[DEV] Using Hyperdrive connection");
    db = createDb(cf.env.HYPERDRIVE);
  } else if (cf && cf.env.HYPERDRIVE_DIRECT) {
    console.log("[DEV] Using Hyperdrive Direct connection");
    db = createDb(cf.env.HYPERDRIVE_DIRECT);
  } else {
    // Fallback for local development - use DATABASE_URL directly
    console.log("[DEV] Hyperdrive not available, using direct DATABASE_URL connection");
    const { createDbDirect } = await import("./lib/db-direct");
    db = createDbDirect();
  }
  
  c.set("db", db);
  // Use process.env for auth to access .env.local variables
  const authEnv = {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!
  };
  c.set("auth", createAuth(db, authEnv));
  await next();
});

/**
 * Mount the main API routes.
 * All routes defined in ./index.js will be available at the root path.
 */
app.route("/", api);

/**
 * Export the configured app for Bun to auto-serve
 */
console.log(`[DEV] API server configured for port 8787`);

export default {
  port: 8787,
  fetch: app.fetch,
};
