#!/usr/bin/env bun

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "../schema";

// Import drizzle config to trigger environment loading
import "../drizzle.config";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

try {
  const orgs = await db.select().from(schema.organization);
  console.log(`Organizations: ${orgs.length}`);
  if (orgs.length > 0) {
    console.log("First org:", orgs[0].name);
  }

  const users = await db.select().from(schema.user);
  console.log(`Users: ${users.length}`);
  if (users.length > 0) {
    console.log("First user:", users[0].name);
  }

  const tasks = await db.select().from(schema.taskSpecification);
  console.log(`Tasks: ${tasks.length}`);

  const carePlans = await db.select().from(schema.carePlan);
  console.log(`Care Plans: ${carePlans.length}`);
  if (carePlans.length > 0) {
    console.log("Care Plans:");
    carePlans.forEach((plan) => {
      console.log(`  - ${plan.title} (${plan.status})`);
    });
  }
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
}
