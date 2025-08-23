#!/usr/bin/env bun

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "../schema";

// Import drizzle config to trigger environment loading
import "../drizzle.config";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

try {
  console.log("=== CARE PLAN DETAILS ===\n");
  
  const carePlans = await db.select().from(schema.carePlan);
  
  carePlans.forEach((plan, index) => {
    console.log(`Care Plan ${index + 1}:`);
    console.log(`  ID: ${plan.id}`);
    console.log(`  Title: ${plan.title}`);
    console.log(`  Description: ${plan.description || 'NULL'}`);
    console.log(`  Status: ${plan.status}`);
    console.log(`  Content: ${plan.content ? 'Has content' : 'NULL'}`);
    console.log(`  Metadata: ${plan.metadata ? 'Has metadata' : 'NULL'}`);
    console.log(`  Created At: ${plan.createdAt}`);
    console.log(`  Updated At: ${plan.updatedAt}`);
    console.log(`  Created By: ${plan.createdBy || 'NULL'}`);
    console.log(`  Updated By: ${plan.updatedBy || 'NULL'}`);
    console.log(`  Organization ID: ${plan.organizationId}`);
    console.log("");
  });
  
  console.log("=== CARE PLAN SCHEMA FIELDS ===\n");
  console.log("Available fields in care plan table:");
  const fields = Object.keys(schema.carePlan);
  fields.forEach(field => {
    console.log(`  - ${field}`);
  });
  
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
}
