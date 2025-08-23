// Test minimal Zod schema to isolate the issue
import { z } from "zod";

console.log("Testing Zod schemas...");

// Test 1: Basic schema
try {
  const basicSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
  });

  const result1 = basicSchema.parse({ id: "test", name: "test name" });
  console.log("✅ Basic schema works:", result1);
} catch (error) {
  console.error("❌ Basic schema failed:", error);
}

// Test 2: Schema with z.any()
try {
  const anySchema = z.object({
    id: z.string(),
    data: z.any().optional(),
  });

  const result2 = anySchema.parse({ id: "test", data: { some: "object" } });
  console.log("✅ z.any() schema works:", result2);
} catch (error) {
  console.error("❌ z.any() schema failed:", error);
}

// Test 3: Schema with z.unknown()
try {
  const unknownSchema = z.object({
    id: z.string(),
    data: z.unknown().optional(),
  });

  const result3 = unknownSchema.parse({ id: "test", data: { some: "object" } });
  console.log("✅ z.unknown() schema works:", result3);
} catch (error) {
  console.error("❌ z.unknown() schema failed:", error);
}

// Test 4: The problematic update schema (simplified)
try {
  const updateSchema = z.object({
    id: z.string(),
    versionStatus: z.string().optional(),
    metadata: z.any().optional(),
  });

  const result4 = updateSchema.parse({
    id: "test",
    versionStatus: "draft",
    metadata: { description: "test" },
  });
  console.log("✅ Update schema works:", result4);
} catch (error) {
  console.error("❌ Update schema failed:", error);
}

console.log("Zod version:", z.version || "unknown");
