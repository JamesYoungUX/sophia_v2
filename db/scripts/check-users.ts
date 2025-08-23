#!/usr/bin/env bun

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "../schema";

// Import drizzle config to trigger environment loading
import "../drizzle.config";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

try {
  const users = await db.select().from(schema.user);
  console.log(`Users: ${users.length}`);
  users.forEach((user) => {
    console.log(`- ${user.email} (${user.name})`);
  });
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
}
