#!/usr/bin/env bun

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "../schema";

// Import drizzle config to trigger environment loading
import "../drizzle.config";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

try {
  console.log("=== FULL CARE PLAN CONTENT ===\n");
  
  const carePlans = await db.select({
    id: schema.carePlan.id,
    title: schema.carePlan.title,
    description: schema.carePlan.description,
    content: schema.carePlan.content,
    metadata: schema.carePlan.metadata,
    status: schema.carePlan.status,
  }).from(schema.carePlan);
  
  carePlans.forEach((plan, index) => {
    console.log(`\n=== Care Plan ${index + 1}: ${plan.title} ===`);
    console.log(`Description: ${plan.description}`);
    console.log(`Status: ${plan.status}`);
    
    console.log("\n--- FULL CONTENT ---");
    if (plan.content) {
      console.log(plan.content);
    } else {
      console.log("NULL");
    }
    
    console.log("\n--- FULL METADATA ---");
    if (plan.metadata) {
      console.log(plan.metadata);
    } else {
      console.log("NULL");
    }
    
    console.log("\n" + "=".repeat(80));
  });
  
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
}
