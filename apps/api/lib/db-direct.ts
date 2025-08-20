/**
 * Direct database client for local development without Hyperdrive.
 *
 * This module provides a fallback database connection that uses the DATABASE_URL
 * environment variable directly when Cloudflare Hyperdrive bindings are not available.
 * This is primarily used for local development scenarios.
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { schema } from "@repo/db";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Creates a direct database client using DATABASE_URL environment variable.
 *
 * This function is used as a fallback when Hyperdrive bindings are not available,
 * typically during local development. It connects directly to the PostgreSQL
 * database using the connection string from the DATABASE_URL environment variable.
 *
 * @returns Drizzle ORM database client with postgres.js adapter
 * @throws Will throw if DATABASE_URL is not set or connection fails
 *
 * @example
 * ```typescript
 * // For local development without Hyperdrive
 * const db = createDbDirect();
 * const users = await db.select().from(Db.users);
 * ```
 */
export function createDbDirect() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is required for direct database connection. " +
      "Please check your .env.local file."
    );
  }

  const client = postgres(databaseUrl, {
    max: 1,
    connect_timeout: 10,
    prepare: false, // Recommended for Cloudflare Workers compatibility
    idle_timeout: 20, // Close idle connections quickly
    max_lifetime: 60 * 30, // 30 minutes max connection lifetime
    transform: {
      undefined: null, // Convert undefined to null for PostgreSQL
    },
    onnotice: () => {}, // Suppress notices
  });

  return drizzle(client, { schema });
}

/**
 * Database schema re-exported as `Db` for convenient table access.
 */
export { schema as Db };