CREATE TABLE "care_exception" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"patient_id" text NOT NULL,
	"type" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"first_detected_at" timestamp with time zone,
	"last_detected_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"escalated" boolean DEFAULT false NOT NULL,
	"escalated_at" timestamp with time zone,
	"escalated_by_type" text,
	"escalated_by_agent" text DEFAULT 'compliance',
	"escalation_reason" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "care_exception" ADD CONSTRAINT "care_exception_patient_id_patient_pat_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("pat_id") ON DELETE cascade ON UPDATE no action;