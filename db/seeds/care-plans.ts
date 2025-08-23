import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema as Db } from "../schema";

const DEBUG_LOG = true;

type CarePlanInsert = typeof Db.carePlan.$inferInsert;
type CarePlanVersionInsert = typeof Db.carePlanVersion.$inferInsert;

// Sample care plan content structure
export const createCarePlanContent = (planType: string) => {
  switch (planType) {
    case "hypertension-management":
      return {
        phases: [
          {
            name: "Initial Assessment",
            daysFromStart: 0,
            tasks: [
              {
                taskId: "HTN-001",
                name: "Blood Pressure Measurement",
                description: "Measure BP using standardized technique",
                category: "Assessment",
                priority: "high",
                evidence: {
                  source: "AHA Hypertension Guidelines 2024",
                  url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000200",
                  level: "A",
                },
              },
              {
                taskId: "HTN-002",
                name: "Cardiovascular Risk Assessment",
                description:
                  "Assess 10-year cardiovascular risk using ASCVD calculator",
                category: "Assessment",
                priority: "high",
                evidence: {
                  source: "ACC/AHA Risk Assessment Guidelines",
                  url: "https://www.acc.org/guidelines",
                  level: "A",
                },
              },
            ],
          },
          {
            name: "Treatment Initiation",
            daysFromStart: 7,
            tasks: [
              {
                taskId: "HTN-003",
                name: "Lifestyle Modification Counseling",
                description: "Provide DASH diet and exercise recommendations",
                category: "Education",
                priority: "medium",
                evidence: {
                  source: "DASH Diet Clinical Trials",
                  url: "https://www.nejm.org/doi/full/10.1056/NEJM199704173361601",
                  level: "A",
                },
              },
              {
                taskId: "HTN-004",
                name: "Medication Initiation",
                description: "Start first-line antihypertensive medication",
                category: "Medication",
                priority: "high",
                evidence: {
                  source: "AHA Hypertension Guidelines 2024",
                  url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000200",
                  level: "A",
                },
              },
            ],
          },
          {
            name: "Follow-up and Monitoring",
            daysFromStart: 30,
            tasks: [
              {
                taskId: "HTN-005",
                name: "BP Reassessment",
                description: "Reassess BP and medication effectiveness",
                category: "Assessment",
                priority: "high",
                evidence: {
                  source: "AHA Hypertension Guidelines 2024",
                  url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000200",
                  level: "A",
                },
              },
            ],
          },
        ],
        targetBP: "<130/80 mmHg",
        evidenceLastUpdated: "2024-01-15",
      };

    case "diabetes-management":
      return {
        phases: [
          {
            name: "Initial Assessment",
            daysFromStart: 0,
            tasks: [
              {
                taskId: "DM-001",
                name: "HbA1c Measurement",
                description: "Measure HbA1c for glycemic control assessment",
                category: "Assessment",
                priority: "high",
                evidence: {
                  source: "ADA Standards of Medical Care 2024",
                  url: "https://diabetesjournals.org/care/issue/47/Supplement_1",
                  level: "A",
                },
              },
              {
                taskId: "DM-002",
                name: "Cardiovascular Risk Assessment",
                description: "Assess cardiovascular risk factors",
                category: "Assessment",
                priority: "high",
                evidence: {
                  source: "ADA Cardiovascular Disease Guidelines",
                  url: "https://diabetesjournals.org/care/article/47/Supplement_1/S158",
                  level: "A",
                },
              },
            ],
          },
          {
            name: "Treatment Optimization",
            daysFromStart: 14,
            tasks: [
              {
                taskId: "DM-003",
                name: "SGLT2 Inhibitor Consideration",
                description:
                  "Consider SGLT2 inhibitor for cardiovascular protection",
                category: "Medication",
                priority: "high",
                evidence: {
                  source: "EMPA-REG OUTCOME Trial",
                  url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1504720",
                  level: "A",
                },
              },
            ],
          },
        ],
        targetHbA1c: "<7.0%",
        evidenceLastUpdated: "2024-01-20",
      };

    case "surgical-recovery":
      return {
        phases: [
          {
            name: "Pre-operative Preparation",
            daysFromStart: -7,
            tasks: [
              {
                taskId: "SURG-001",
                name: "Pre-operative Assessment",
                description: "Complete comprehensive pre-operative evaluation",
                category: "Assessment",
                priority: "critical",
                evidence: {
                  source: "ASA Pre-operative Guidelines",
                  url: "https://pubs.asahq.org/anesthesiology/article/134/4/679/115682",
                  level: "A",
                },
              },
            ],
          },
          {
            name: "Enhanced Recovery",
            daysFromStart: 0,
            tasks: [
              {
                taskId: "SURG-002",
                name: "Early Mobilization",
                description: "Begin early mobilization within 24 hours",
                category: "Rehabilitation",
                priority: "high",
                evidence: {
                  source: "Enhanced Recovery After Surgery Guidelines",
                  url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5565992/",
                  level: "A",
                },
              },
            ],
          },
        ],
        evidenceLastUpdated: "2024-02-01",
      };

    default:
      return {
        phases: [],
        evidenceLastUpdated: new Date().toISOString().split("T")[0],
      };
  }
};

const sampleCarePlans: CarePlanInsert[] = [
  {
    title: "Hypertension Management Protocol",
    description: "Evidence-based protocol for managing hypertension in adults",
    content: createCarePlanContent("hypertension-management"),
    status: "active",
    versionNumber: 1,
    isTemplate: true,
    searchVector: "hypertension blood pressure management protocol",
    metadata: {
      category: "chronic-care",
      specialty: "cardiology",
      targetPopulation: "adults",
      evidenceLevel: "A",
    },
    // Required fields - will be set by seeding function
    organizationId: "",
    createdBy: "",
    updatedBy: "",
  },
  {
    title: "Type 2 Diabetes Management Protocol",
    description: "Comprehensive diabetes management following ADA guidelines",
    content: createCarePlanContent("diabetes-management"),
    status: "active",
    versionNumber: 1,
    isTemplate: true,
    searchVector: "diabetes mellitus type 2 management protocol",
    metadata: {
      category: "chronic-care",
      specialty: "endocrinology",
      targetPopulation: "adults",
      evidenceLevel: "A",
    },
    organizationId: "",
    createdBy: "",
    updatedBy: "",
  },
  {
    title: "Enhanced Recovery After Surgery Protocol",
    description: "ERAS protocol for surgical patients to improve outcomes",
    content: createCarePlanContent("surgical-recovery"),
    status: "active",
    versionNumber: 1,
    isTemplate: true,
    searchVector: "enhanced recovery after surgery ERAS protocol",
    metadata: {
      category: "surgical",
      specialty: "surgery",
      targetPopulation: "surgical patients",
      evidenceLevel: "A",
    },
    organizationId: "",
    createdBy: "",
    updatedBy: "",
  },
];

export async function seedCarePlans(db: PostgresJsDatabase<typeof Db>) {
  try {
    if (DEBUG_LOG) console.log("🏥 Starting care plan seeding...");

    // Get first organization and user for required fields
    const [firstOrg] = await db.select().from(Db.organization).limit(1);
    const [firstUser] = await db.select().from(Db.user).limit(1);

    if (!firstOrg || !firstUser) {
      console.warn(
        "⚠️ No organization or user found. Skipping care plan seeding.",
      );
      return [];
    }

    if (DEBUG_LOG)
      console.log(
        `📋 Using organization: ${firstOrg.name}, user: ${firstUser.name}`,
      );

    // Fill in required fields
    const carePlansToInsert = sampleCarePlans.map((plan) => ({
      ...plan,
      organizationId: firstOrg.id,
      createdBy: firstUser.id,
      updatedBy: firstUser.id,
    }));

    // Clear existing care plans
    await db.delete(Db.carePlan);
    if (DEBUG_LOG) console.log("🗑️ Cleared existing care plans");

    // Insert sample care plans
    const insertedCarePlans = await db
      .insert(Db.carePlan)
      .values(carePlansToInsert)
      .returning();

    if (DEBUG_LOG) {
      console.log(
        `✅ Successfully seeded ${insertedCarePlans.length} care plans:`,
      );
      insertedCarePlans.forEach((plan: any) => {
        console.log(`  - ${plan.title} (${plan.status})`);
      });
    }

    // Create initial versions for each care plan
    const carePlanVersions: CarePlanVersionInsert[] = insertedCarePlans.map(
      (plan) => ({
        carePlanId: plan.id,
        versionNumber: 1,
        title: plan.title,
        description: plan.description,
        content: plan.content,
        changeLog: "Initial version",
        metadata: {
          createdBy: firstUser.name,
          evidenceSources:
            plan.content.phases?.flatMap(
              (phase) =>
                phase.tasks
                  ?.map((task) => task.evidence?.source)
                  .filter(Boolean) || [],
            ) || [],
        },
        createdBy: firstUser.id,
      }),
    );

    // Clear existing versions and insert new ones
    await db.delete(Db.carePlanVersion);
    const insertedVersions = await db
      .insert(Db.carePlanVersion)
      .values(carePlanVersions)
      .returning();

    if (DEBUG_LOG) {
      console.log(`✅ Created ${insertedVersions.length} care plan versions`);
    }

    return insertedCarePlans;
  } catch (error) {
    console.error("❌ Error seeding care plans:", error);
    throw error;
  }
}

// This seed function is called from the main seeding script
