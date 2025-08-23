#!/usr/bin/env bun

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "../schema";

// Import drizzle config to trigger environment loading
import "../drizzle.config";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

try {
  const carePlans = await db.select().from(schema.carePlan);
  console.log("Care Plans with organization IDs:");
  carePlans.forEach((plan) => 
    console.log(`- ${plan.title} (Org ID: ${plan.organizationId})`)
  );
  
  const orgs = await db.select().from(schema.organization);
  console.log("\nOrganizations:");
  orgs.forEach((org) => 
    console.log(`- ${org.name} (ID: ${org.id})`)
  );
  
  const users = await db.select().from(schema.user);
  console.log("\nUsers with organization IDs:");
  users.forEach((user) => 
    console.log(`- ${user.name} (${user.email}) - Org ID: ${user.organizationId}`)
  );
  
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
}
