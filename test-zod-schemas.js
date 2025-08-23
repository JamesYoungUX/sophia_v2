// Quick test to verify Zod schemas work correctly
import { z } from "zod";

// Test the fixed schemas
const taskCreateSchema = z.object({
  taskId: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["Education", "Lifestyle/Health", "Logistics", "Medical"]),
  status: z
    .enum([
      "pending",
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
      "deferred",
      "failed",
    ])
    .default("pending"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  versionStatus: z.enum(["draft", "active", "inactive"]).default("active"),
  instructionPatient: z.string().min(1),
  instructionClinician: z.string().min(1),
  timingOffsetDays: z.number().default(0),
  timingDurationDays: z.number().default(1),
  timingTimeOfDay: z.string().default("any"),
  timingIsFlexible: z.boolean().default(true),
  conditions: z.object({}).passthrough().default({}),
  evidenceSource: z.string().optional(),
  evidenceUrl: z.string().optional(),
  evidenceLevel: z.string().default("Level 3"),
  evidencePublicationDate: z.string().optional(),
  evidenceNotes: z.string().optional(),
  isActive: z.boolean().default(true),
  isTemplate: z.boolean().default(true),
  isValid: z.boolean().default(false),
  metadata: z
    .object({
      description: z.string().optional(),
      estimatedDuration: z.string().optional(),
      dependencies: z.array(z.string()).optional(),
      completionCriteria: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
});

// Test data
const testData = {
  taskId: "TEST-001",
  name: "Test Task",
  category: "Education",
  instructionPatient: "Test patient instruction",
  instructionClinician: "Test clinician instruction",
  conditions: {
    medications: ["aspirin"],
    surgery_types: ["cardiac"],
  },
  metadata: {
    description: "Test description",
    tags: ["test", "example"],
  },
};

try {
  const result = taskCreateSchema.parse(testData);
  console.log("✅ Schema validation passed:", result);
} catch (error) {
  console.error("❌ Schema validation failed:", error);
}
