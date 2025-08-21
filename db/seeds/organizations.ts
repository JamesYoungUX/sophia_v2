import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema as Db } from "../schema";

const DEBUG_LOG = true;

type OrganizationInsert = typeof Db.organization.$inferInsert;

const sampleOrganizations: OrganizationInsert[] = [
  {
    name: "Sophia Medical Center",
    slug: "sophia-medical",
    logo: "https://example.com/logo.png",
    metadata: JSON.stringify({
      description: "A comprehensive healthcare facility providing advanced medical care and surgical services.",
      website: "https://sophia-medical.com",
      email: "contact@sophia-medical.com",
      phone: "+1-555-0123",
      address: "123 Medical Plaza, Healthcare City, HC 12345",
      isActive: true,
    }),
  },
];

export async function seedOrganizations(db: PostgresJsDatabase<typeof Db>) {
  try {
    if (DEBUG_LOG) console.log('🏥 Starting organization seeding...');
    
    // Check if organizations already exist
    const existingOrgs = await db.select().from(Db.organization).limit(1);
    if (existingOrgs.length > 0) {
      if (DEBUG_LOG) console.log('⚠️ Organizations already exist, skipping seeding.');
      return existingOrgs;
    }
    
    // Insert sample organizations
    const insertedOrgs = await db.insert(Db.organization).values(sampleOrganizations).returning();
    
    if (DEBUG_LOG) {
      console.log(`✅ Successfully seeded ${insertedOrgs.length} organizations:`);
      insertedOrgs.forEach((org: any) => {
        console.log(`  - ${org.name} (${org.slug})`);
      });
    }
    
    return insertedOrgs;
  } catch (error) {
    console.error('❌ Error seeding organizations:', error);
    throw error;
  }
}