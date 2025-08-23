/**
 * This file exports a Hono application that serves as the main API router.
 * It integrates tRPC for type-safe API endpoints and includes authentication routes.
 * The design allows for flexible deployment, either as a standalone service or
 * as part of an edge environment like Cloudflare Workers.
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { Db } from "@repo/db";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import type { AppContext } from "./lib/context.js";
import { router } from "./lib/trpc.js";
import { careExceptionRouter } from "./routers/care-exception.js";
import { carePlanRouter } from "./routers/care-plan.js";
import { organizationRouter } from "./routers/organization.js";
import { patientRouter } from "./routers/patient.js";
import { taskRouter } from "./routers/task.js";
import { userRouter } from "./routers/user.js";

// DEBUG flag for startup instrumentation
const DEBUG_LOG = true;
if (DEBUG_LOG) {
  try {
    const cePre = Object.keys((careExceptionRouter as any)?._def?.record ?? {});
    const ptPre = Object.keys((patientRouter as any)?._def?.record ?? {});
    const orgPre = Object.keys((organizationRouter as any)?._def?.record ?? {});
    const userPre = Object.keys((userRouter as any)?._def?.record ?? {});
    console.log(
      "[DEBUG] PRE appRouter compose - careExceptionRouter keys:",
      cePre,
    );
    console.log("[DEBUG] PRE appRouter compose - patientRouter keys:", ptPre);
    console.log(
      "[DEBUG] PRE appRouter compose - organizationRouter keys:",
      orgPre,
    );
    console.log("[DEBUG] PRE appRouter compose - userRouter keys:", userPre);
  } catch (e) {
    console.log(
      "[DEBUG] PRE appRouter compose: error while reading child keys",
      e,
    );
  }
}

// tRPC API router
const appRouter = router({
  user: userRouter,
  organization: organizationRouter,
  patient: patientRouter,
  careException: careExceptionRouter,
  carePlan: carePlanRouter,
  task: taskRouter,
  // TEMP: alias to test routing under alternate key
  careExceptions: careExceptionRouter,
});

// DEBUG: Enumerate router keys at startup to confirm runtime composition
if (DEBUG_LOG) {
  try {
    const routerKeys = Object.keys((appRouter as any)?._def?.record ?? {});
    console.log("[DEBUG] appRouter keys:", routerKeys);
    console.log("[DEBUG] tRPC mounted at:", "/api/trpc");

    const readChildKeys = (label: string, node: any) => {
      const hasRecord = !!node?._def && !!(node as any)?._def?.record;
      const keys = hasRecord
        ? Object.keys((node as any)?._def?.record ?? {})
        : [];
      console.log(
        `[DEBUG] POST compose - ${label} hasRecord=${hasRecord} keys=`,
        keys,
      );
    };

    readChildKeys("patient", (appRouter as any)?._def?.record?.patient);
    readChildKeys(
      "organization",
      (appRouter as any)?._def?.record?.organization,
    );
    readChildKeys("user", (appRouter as any)?._def?.record?.user);
    readChildKeys(
      "careException",
      (appRouter as any)?._def?.record?.careException,
    );
    readChildKeys(
      "careExceptions (alias)",
      (appRouter as any)?._def?.record?.careExceptions,
    );

    // Optional: enumerate full procedure paths
    const collectPaths = (node: any, prefix = ""): string[] => {
      if (!node?._def) return [];
      const record = (node as any)?._def?.record ?? {};
      const keys = Object.keys(record);
      const paths: string[] = [];
      for (const k of keys) {
        const child = record[k];
        const isRouter = !!child?._def?.record;
        if (isRouter) {
          paths.push(...collectPaths(child, prefix ? `${prefix}.${k}` : k));
        } else {
          paths.push(prefix ? `${prefix}.${k}` : k);
        }
      }
      return paths;
    };
    const allPaths = collectPaths(appRouter as any);
    console.log("[DEBUG] tRPC procedure paths:", allPaths);
  } catch (err) {
    console.error("[DEBUG] Failed to enumerate appRouter keys:", err);
  }
}

// HTTP router
const app = new Hono<AppContext>();

// Root endpoint with API information
app.get("/", (c) => {
  return c.json({
    name: "@repo/api",
    version: "0.0.0",
    endpoints: {
      trpc: "/api/trpc",
      auth: "/api/auth",
      health: "/health",
    },
    documentation: {
      trpc: "https://trpc.io",
      auth: "https://www.better-auth.com",
    },
  });
});

// Health check endpoint
app.get("/health", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        carePlans: "Database not available",
      });
    }

    const plans = await db
      .select({
        id: Db.carePlan.id,
        title: Db.carePlan.title,
        status: Db.carePlan.status,
      })
      .from(Db.carePlan)
      .limit(5);

    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      carePlans: {
        count: plans.length,
        plans: plans,
      },
    });
  } catch (error) {
    console.error("Error in health check:", error);
    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      carePlans: "Error fetching care plans",
    });
  }
});

// Test endpoint to check care plans without authentication
app.get("/test/care-plans", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 503);
    }

    const plans = await db
      .select({
        id: Db.carePlan.id,
        title: Db.carePlan.title,
        description: Db.carePlan.description,
        status: Db.carePlan.status,
        createdAt: Db.carePlan.createdAt,
        updatedAt: Db.carePlan.updatedAt,
      })
      .from(Db.carePlan)
      .limit(10);

    return c.json({
      success: true,
      count: plans.length,
      plans: plans,
    });
  } catch (error) {
    console.error("Error fetching care plans:", error);
    return c.json(
      {
        error: "Failed to fetch care plans",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

/*
 * Middleware for initializing database and authentication services.
 *
 * This section is commented out by default. It should be enabled when
 * deploying the `api` package as a standalone service (e.g., to Google Cloud Run).
 *
 * When this API is deployed as part of the `edge` package (Cloudflare Workers),
 * the `db` and `auth` context variables are initialized upstream.
 */
// app.use("*", async (c, next) => {
//   c.set("db", drizzle(...));
//   c.set("auth", createAuth(c.get("db"), c.env));
//   await next();
// });

// Authentication routes
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  const auth = c.get("auth");
  if (!auth) {
    return c.json({ error: "Authentication service not initialized" }, 503);
  }
  return auth.handler(c.req.raw);
});

// tRPC API routes
app.use("/api/trpc/*", (c) => {
  return fetchRequestHandler({
    req: c.req.raw,
    router: appRouter,
    endpoint: "/api/trpc",
    async createContext({ req, resHeaders, info }) {
      const db = c.get("db");
      const auth = c.get("auth");

      if (!db) {
        throw new Error("Database not available in context");
      }

      if (!auth) {
        throw new Error("Authentication service not available in context");
      }

      const sessionData = await auth.api.getSession({
        headers: req.headers,
      });

      return {
        req,
        res: c.res,
        resHeaders,
        info,
        env: c.env,
        db,
        session: sessionData?.session ?? null,
        user: sessionData?.user ?? null,
        cache: new Map(),
      };
    },
    batching: {
      enabled: true,
    },
    onError({ error, path }) {
      console.error("tRPC error on path", path, ":", error);
    },
  });
});

export { getOpenAI } from "./lib/ai.js";
export { createAuth } from "./lib/auth.js";
export { createDb } from "./lib/db.js";
export { appRouter };

export type { AppContext } from "./lib/context.js";
export type AppRouter = typeof appRouter;

export default app;
