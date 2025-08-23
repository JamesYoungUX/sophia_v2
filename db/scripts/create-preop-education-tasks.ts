import { configDotenv } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { taskSpecification } from "../schema/task-management.js";

// Load environment variables
configDotenv({ path: "../.env.local" });
configDotenv({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function createPreopEducationTasks() {
  console.log("📚 Creating pre-operative education tasks...\n");

  try {
    const educationTasks = [
      {
        name: "About Your Surgery",
        description:
          "Learn about your surgical procedure and recovery timeline",
        instructions: `Step-by-step overview of the surgical procedure.
Expected hospital stay and recovery timeline.`,
        category: "Education",
        priority: "high",
        estimatedDuration: 30,
        dependencies: [],
        completionCriteria: [
          "Complete surgical overview review",
          "Understand recovery timeline",
        ],
        tags: ["pre-op", "education", "surgery-overview"],
      },
      {
        name: "Anesthesia 101",
        description: "Understand anesthesia types and what to expect",
        instructions: `What types of anesthesia are used.
What to expect when going to sleep and waking up.`,
        category: "Education",
        priority: "high",
        estimatedDuration: 20,
        dependencies: [],
        completionCriteria: [
          "Understand anesthesia types",
          "Know what to expect during anesthesia",
        ],
        tags: ["pre-op", "education", "anesthesia"],
      },
      {
        name: "Pain Management",
        description: "Learn about pain control methods and communication",
        instructions: `How pain will be controlled (medications, nerve blocks, non-drug methods).
How to use a pain scale to communicate discomfort.`,
        category: "Education",
        priority: "high",
        estimatedDuration: 25,
        dependencies: [],
        completionCriteria: [
          "Understand pain control options",
          "Practice pain scale usage",
        ],
        tags: ["pre-op", "education", "pain-management"],
      },
      {
        name: "Infection Prevention",
        description: "Learn about infection prevention and wound care",
        instructions: `Why Hibiclens (chlorhexidine) showers are required.
How to keep your incision clean at home.`,
        category: "Education",
        priority: "high",
        estimatedDuration: 15,
        dependencies: [],
        completionCriteria: [
          "Understand Hibiclens requirements",
          "Learn wound care techniques",
        ],
        tags: ["pre-op", "education", "infection-prevention"],
      },
      {
        name: "Medication Safety",
        description: "Review medication management before surgery",
        instructions: `Which medications to stop, adjust, or continue before surgery.
What to bring (or not bring) the day of surgery.`,
        category: "Education",
        priority: "high",
        estimatedDuration: 20,
        dependencies: [],
        completionCriteria: [
          "Review medication list",
          "Understand pre-op medication changes",
        ],
        tags: ["pre-op", "education", "medication-safety"],
      },
      {
        name: "Nutrition & Activity",
        description: "Learn about diet and activity recommendations",
        instructions: `Diet recommendations before surgery.
Role of protein in healing.
Early mobilization after surgery and safe movement techniques.`,
        category: "Education",
        priority: "medium",
        estimatedDuration: 20,
        dependencies: [],
        completionCriteria: [
          "Understand diet recommendations",
          "Learn activity guidelines",
        ],
        tags: ["pre-op", "education", "nutrition", "activity"],
      },
      {
        name: "Discharge & Recovery Planning",
        description: "Plan for discharge and home recovery",
        instructions: `What to expect at home (pain, mobility, wound care).
Warning signs that require calling your care team.
How to schedule follow-up visits.`,
        category: "Education",
        priority: "high",
        estimatedDuration: 25,
        dependencies: [],
        completionCriteria: [
          "Understand home recovery expectations",
          "Know warning signs",
          "Plan follow-up visits",
        ],
        tags: ["pre-op", "education", "discharge-planning"],
      },
      {
        name: "Logistics & Hospital Routine",
        description: "Learn about hospital logistics and routines",
        instructions: `Where to check in and what to bring.
Visitor policy and support person requirements.
How to prepare your home before discharge.`,
        category: "Education",
        priority: "medium",
        estimatedDuration: 15,
        dependencies: [],
        completionCriteria: [
          "Know check-in location",
          "Understand visitor policy",
          "Prepare home",
        ],
        tags: ["pre-op", "education", "logistics"],
      },
    ];

    console.log(`📝 Creating ${educationTasks.length} education tasks...\n`);

    for (const task of educationTasks) {
      // Generate a normalized task ID like T-preop-edu-12345
      // Use timestamp + random for better uniqueness
      const timestamp = Date.now().toString().slice(-5); // Last 5 digits of timestamp
      const randomSuffix = crypto.randomUUID().slice(0, 2); // 2 chars from UUID
      const taskId = `T-preop-edu-${timestamp}${randomSuffix}`;

      const result = await db.insert(taskSpecification).values({
        id: crypto.randomUUID(),
        taskId: taskId,
        name: task.name,
        category: task.category,
        instructionPatient: task.instructions,
        instructionClinician: task.instructions,
        timingOffsetDays: 30,
        timingDurationDays: 1,
        timingTimeOfDay: "any",
        timingIsFlexible: true,
        conditions: {},
        evidenceSource: "Clinical Guidelines",
        evidenceUrl: "https://example.com/guidelines",
        evidenceLevel: "Level 1",
        evidencePublicationDate: "2024-01-01",
        evidenceNotes: "Standard pre-operative education requirements",
        status: "pending",
        priority: task.priority,
        versionStatus: "draft",
        version: "1.0.0",
        isActive: true,
        isTemplate: true,
        isValid: false,
        validationErrors: null,
        validationScore: 0,
        organizationId: "0198cd5b-c4d9-79d0-83f9-55710b1b25c9", // Sophia Medical Center
        teamId: null,
        metadata: {
          description: task.description,
          estimatedDuration: task.estimatedDuration,
          dependencies: task.dependencies,
          completionCriteria: task.completionCriteria,
          tags: task.tags,
        },
        searchVector: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "0198c8f2-0221-7524-b915-d3361906972c", // James Young
        updatedBy: "0198c8f2-0221-7524-b915-d3361906972c", // James Young
      });

      console.log(`✅ Created task: ${task.name}`);
    }

    console.log(
      `\n🎉 Successfully created ${educationTasks.length} pre-operative education tasks!`,
    );
  } catch (error) {
    console.error("❌ Error creating education tasks:", error);
  } finally {
    await client.end();
  }
}

createPreopEducationTasks();
