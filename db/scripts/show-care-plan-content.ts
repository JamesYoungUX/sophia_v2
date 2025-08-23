#!/usr/bin/env bun

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "../schema";

// Import drizzle config to trigger environment loading
import "../drizzle.config";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

try {
  console.log("=== CARE PLAN CONTENT AND METADATA ===\n");
  
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
    
    console.log("\n--- CONTENT ---");
    if (plan.content) {
      try {
        const content = JSON.parse(plan.content);
        console.log(JSON.stringify(content, null, 2));
      } catch (e) {
        console.log("Raw content (not JSON):", plan.content);
      }
    } else {
      console.log("NULL");
    }
    
    console.log("\n--- METADATA ---");
    if (plan.metadata) {
      try {
        const metadata = JSON.parse(plan.metadata);
        console.log(JSON.stringify(metadata, null, 2));
      } catch (e) {
        console.log("Raw metadata (not JSON):", plan.metadata);
      }
    } else {
      console.log("NULL");
    }
    
    console.log("\n" + "=".repeat(50));
  });
  
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
}
