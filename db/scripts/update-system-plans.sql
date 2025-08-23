-- Update existing care plans to be system-level templates
-- This script marks the default care plans as system templates available to all users

-- Mark existing care plans as system-level templates
UPDATE care_plan
SET plan_level = 'system',
    is_template = true
WHERE title IN (
  'Hypertension Management Protocol',
  'Type 2 Diabetes Management Protocol',
  'Enhanced Recovery After Surgery Protocol'
);

-- Set organization_id to NULL for system plans (they belong to all organizations)
UPDATE care_plan
SET organization_id = NULL
WHERE plan_level = 'system';

-- Add a comment to document the system plans
COMMENT ON TABLE care_plan IS 'Care plans with hierarchical access levels: system (global), organization, team, personal';

