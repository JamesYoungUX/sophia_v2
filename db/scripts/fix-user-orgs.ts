#!/usr/bin/env bun

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "../schema";

// Import drizzle config to trigger environment loading
import "../drizzle.config";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

try {
  // Get the organization
  const orgs = await db.select().from(schema.organization);
  if (orgs.length === 0) {
    console.log("No organizations found");
  } else {
    const org = orgs[0];
    console.log(`Using organization: ${org.name} (${org.id})`);
    
    // Update all users to belong to this organization
    const result = await db
      .update(schema.user)
      .set({ organizationId: org.id });
    
    console.log(`Updated all users to belong to organization: ${org.name}`);
    
    // Verify the update
    const users = await db.select().from(schema.user);
    console.log("\nUsers after update:");
    users.forEach((user) => 
      console.log(`- ${user.name} (${user.email}) - Org ID: ${user.organizationId}`)
    );
  }
  
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
}
