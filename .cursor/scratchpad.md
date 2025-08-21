- Option 3) Adjust Husky pre-commit to skip tests for now (tooling change)

3) Optional: Approve me to run a read-only DB inspection script (in /debug) that lists public tables and details of care_exception to validate current structure before we choose path A/B/C. This will help avoid surprises. I will not modify data.

Once the migration path and commit strategy are confirmed, I will:
- Complete DB step (apply or record migration as per choice)
- Proceed to Frontend wiring (replace mock data with tRPC, remove Escalate button, add Escalated badge/filter)
- Provide a UI preview before marking UI changes complete

## Care Exceptions Frontend Wiring — Planner Update (Planner Mode)

Background and Motivation
- The Care Exceptions page currently uses a Switch to control the "Escalated only" filter. We want a compact chip-style control consistent with shadcn/ui patterns, using Toggle (single) rather than ToggleGroup, while keeping accessibility, DEBUG_LOG-gated observability, and tests aligned with project conventions.

Key Challenges and Analysis
- UI Consistency: Ensure the new Toggle matches existing design tokens and variants from the shared UI library.
- Package Reuse: Prefer centralized export via @repo/ui to keep DRY and avoid per-app duplicates.
- Accessibility: Toggle must be keyboard and screen-reader friendly with clear label association.
- Minimal Surface Change: Replace only the Switch control and wiring without altering the underlying data fetching logic previously planned for filters.

Design Options Considered
1) Keep Switch and restyle — Minimal code, but not the desired chip UX.
2) Use shadcn/ui Toggle (Chosen) — Compact, standard pattern, easy to read as a filter chip.
3) Use ToggleGroup single-select — Overkill for a single boolean; reserve for future multi-filter chips.

Plan of Record
- Add shadcn/ui Toggle component to the shared UI library and export it.
- Update the Care Exceptions route to replace the Switch with the Toggle chip, maintaining the same escalatedOnly boolean state and onChange handler semantics.
- Ensure proper aria-label and visible label text; keep the "Escalated only" text visible near the control.
- Keep logs gated behind a module-level DEBUG_LOG constant.

High-level Task Breakdown with Success Criteria
A) Add Toggle to @repo/ui
   - Tasks: Install/add Toggle via existing shadcn/ui tooling in the UI package; export from the shared index.
   - Success: Importing Toggle from @repo/ui works in the app; no bundling or type errors.
   - Files in scope: <mcfile name="index.ts" path="/Users/jamesyoung/Documents/sites/sophia2/sophia_v2/packages/ui/index.ts"></mcfile> plus new component under packages/ui/components.

B) Replace Switch with Toggle in Care Exceptions
   - Tasks: Replace the Switch control with Toggle in the route; bind to escalatedOnly; preserve controlled component behavior and visual label.
   - Success: Clicking the Toggle toggles state and refetch (when data integration is wired); UI looks like a chip and remains accessible.
   - File in scope: <mcfile name="care-exceptions.tsx" path="/Users/jamesyoung/Documents/sites/sophia2/sophia_v2/apps/app/routes/care-exceptions.tsx"></mcfile>

C) Verify humanized timestamps
   - Tasks: Review usage of humanizeTime to ensure consistency in cells for firstDetectedAt, lastDetectedAt, escalatedAt.
   - Success: All timestamp displays remain correct and consistent after UI change.

D) Visual QA and Preview
   - Tasks: Manually verify the page renders correctly, Toggle chip aligns with design, and provide a preview URL.
   - Success: No console errors; Toggle behaves as expected; preview shared.

E) Cleanup and Commit
   - Tasks: Ensure DEBUG_LOG gating is respected; remove or disable excessive logs; commit with clear summary.
   - Success: Changes are committed with concise messages; DEBUG_LOG controls any remaining verbose logs.

Testing Plan
- Add/adjust unit tests to cover Toggle-controlled state transitions and rendering of the Escalated badge logic where applicable.
- Keep tests isolated and, where network behavior is involved later, prefer mocks.

Risks & Mitigations
- Risk: Missing export from @repo/ui breaks imports. Mitigation: Add export and run type check before UI changes.
- Risk: Style mismatch vs. app theme. Mitigation: Use shadcn/ui defaults and variants consistent with other components.
- Risk: Accessibility regressions. Mitigation: Maintain visible label and aria-label; test keyboard navigation.

Approval Request
- Please confirm to proceed in Executor mode with Step A) Add Toggle to @repo/ui, followed by Step B) Replace the Switch with Toggle in the Care Exceptions page.

Current State Recap
- The route component renders a table using placeholder data and computes summary stats locally. Authentication guard is in place via requireAuth.
- tRPC client is already configured and provided to the app, pointing to http://localhost:8787/api/trpc.

Design Options Considered (choose the simplest DRY approach)
1) Direct useQuery in the route component
   - Pros: Minimal code, fastest path. Cons: Harder to test and evolve; logic mixed with UI; reuse is limited.
2) Extract a small useCareExceptions hook that wraps api.careException.list.useQuery (Chosen)
   - Pros: Clean separation of data concerns, easy to unit test, reuse across components, small surface area; aligns with modularity requirements.
   - Cons: Slight indirection but negligible.
3) Jotai store for filters + custom fetcher
   - Pros: Centralized state for future pages. Cons: Overkill for current scope; duplicates react-query caching.
4) Route loader-based prefetch
   - Pros: Potentially better for SSR/prefetch later. Cons: Adds routing complexity now and we already have react-query/tRPC idioms.
5) Suspense + ErrorBoundary wrappers
   - Pros: Clean UI patterns for states. Cons: Not required to ship P0; can be a later enhancement.

Plan of Record (Approach 2)
- Implement a focused hook useCareExceptions with params { escalatedOnly?: boolean; severity?: Severity[]; status?: Status[]; patientId?: string } that internally calls api.careException.list.useQuery.
- Update the route component to consume the hook, wire loading/empty/error states, map records to UI, remove the Escalate button/column, and add an Escalated badge when escalatedAt exists.
- Add a simple Escalated-only filter chip/toggle that refetches with escalatedOnly=true.
- Add gated DEBUG_LOG logging and ensure functions remain below size limits; split helper functions as needed.

High-level Task Breakdown with Success Criteria
A) Data integration via tRPC
   - Tasks: Create useCareExceptions hook; replace placeholder data; ensure type-safety using AppRouter types; compute summary from API data.
   - Success: Table renders real records; no TS errors; network request visible; summary counts match dataset.
B) UI adjustments
   - Tasks: Remove Escalate column/button; add Escalated badge with optional timestamp formatting.
   - Success: No Escalate UI present; Escalated badge only appears for records with escalatedAt.
C) Escalated-only filter
   - Tasks: Add a chip/toggle; persist state locally; pass to hook as escalatedOnly.
   - Success: Toggling filter changes query key and result set; visual feedback shows filtered count.
D) Loading/empty/error states
   - Tasks: Show skeleton/spinner while loading; empty-state card if no results; inline error banner with retry.
   - Success: Each state is reachable and legible; retry triggers refetch.
E) Observability and debug logging (gated)
   - Tasks: Add DEBUG_LOG flag; pre/post fetch logs; state transition logs; include variable shape previews.
   - Success: When DEBUG_LOG=true, logs are comprehensive yet focused; when false, no extra logs.
F) Tests (Vitest + React Testing Library, mock tRPC)
   - Tasks: Unit tests for badge rendering, filter behavior, and empty/error states.
   - Success: Tests pass locally; cover primary behaviors without real network calls.
G) Preview
   - Tasks: Manual verification on /care-exceptions; quick UI checklist (counts, badges, filters, states).
   - Success: Visual/functional parity with requirements confirmed.

Data Contract and Key Fields (reference only; align with API types)
- id, patientId, type, severity, status, createdAt, updatedAt, escalatedAt?, escalatedByType?, escalatedByAgent?.
- We will map to: case ID, patient name/ID (if available in record or via future join), severity, status, created date, escalated badge when escalatedAt exists.

Testing Plan Details
- Use happy-dom test environment already configured in the app workspace.
- Mock tRPC via wrapper of api.Provider with a mocked client for unit tests.
- Test cases:
  - Renders rows and summary using provided mock data.
  - Escalated badge appears only when escalatedAt is defined.
  - Escalated-only filter narrows results and updates table/summary.
  - Loading state snapshot; Error state displays banner with retry invoking refetch.

Observability Plan
- Introduce a module-level DEBUG_LOG boolean in the route file or extracted hook.
- Log input params, query keys, response counts, and state transitions with clear prefixes.
- Ensure logs can be turned off centrally by flipping the flag.

Constraints and Conventions to Honor
- No CSS in TSX files; keep existing styles.
- Keep functions under 200 lines; files under 400 lines; extract helpers if needed.
- Do not restart servers unless explicitly instructed.
- Prefer editing existing files; avoid creating new ones unless modularization requires.

Risks & Mitigations
- Data shape drift: Mitigate by using AppRouter types from tRPC and narrowing where necessary.
- UI regression: Mitigate via incremental changes and tests for key behaviors.
- Overfetching on filter: Ensure query keys include filter params to leverage caching and prevent stale data.

Approval Request
- Please confirm this plan and specify if you want me to proceed with Step A (Data integration via tRPC) in Executor mode. I will implement incrementally, add gated logs, and report back with verifiable outcomes before moving to the next step.
- Optionally, approve creating a tiny seed/debug script to insert 2-3 sample care exceptions for visual verification if DB is empty.

Project Status Board (Appended)
- Care Exceptions P0
  - [x] Step 1: DB schema and migration (created + verified)
  - [x] Step 2: API router wired and available
  - [ ] Step 3.A: Data integration and typing (frontend)
  - [ ] Step 3.B: UI adjustments (remove button, add badge)
  - [ ] Step 3.C: Filters (Escalated only)
  - [ ] Step 3.D: States and errors
  - [ ] Step 3.E: Observability (DEBUG_LOG)
  - [ ] Step 3.F: Tests (badge + filter behavior)
  - [ ] Step 3.G: Preview & manual checklist
  - [ ] Step 4: QA + optional seed/debug scripts

Executor Handoff Request
- Please confirm: Proceed with Step 3.A now in Executor mode?

1) Migration resolution options (please choose one):
   - A) Non-destructive: Mark migration "0005_add-care-exception" as applied without changes after verifying the existing care_exception table matches the schema. I can create a small debug script in /debug to introspect the table (columns, types, defaults, constraints) and report. Then I will record the migration as applied. No data loss.
   - B) Destructive (only if safe): Drop the existing care_exception table in the Neon DB and re-run `bun --filter @repo/db migrate` so the migration applies cleanly. This removes any existing data in that table.
   - C) Conditional migration: Modify 0005 migration to conditionally create table/constraints using DO blocks to skip duplicates. More complex but preserves existing data.
   - D) Use `drizzle-kit push` for this environment to sync schema without migrations, then continue using migrations going forward (not ideal as it diverges migration history).

2) Commit strategy for pre-commit hook failure:
   - Option 1) Allow me to commit with `--no-verify` to bypass Husky this time
   - Option 2) I add a minimal placeholder test (e.g., tests/smoke.test.ts) so `bun test` passes, then commit normally
   - Option 3) Adjust Husky pre-commit to skip tests for now (tooling change)

3) Optional: Approve me to run a read-only DB inspection script (in /debug) that lists public tables and details of care_exception to validate current structure before we choose path A/B/C. This will help avoid surprises. I will not modify data.

Once the migration path and commit strategy are confirmed, I will:
- Complete DB step (apply or record migration as per choice)
- Proceed to Frontend wiring (replace mock data with tRPC, remove Escalate button, add Escalated badge/filter)
- Provide a UI preview before marking UI changes complete

Care Exceptions P0 Progress Update
- Executed: Generated migration via `bun --filter @repo/db generate --name add-care-exception` → created db/migrations/0005_add-care-exception.sql
- Executed: Attempted `bun --filter @repo/db migrate` → FAILED with Postgres error 42P07 (relation already exists) when creating table care_exception
- Executed: Aligned WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_* values in .env.local to match active DATABASE_URL per approval
- Pending: Git commit of changes (pre-commit hook failed due to bun test reporting "No tests found!")

BFROS: Migration Failure Analysis (if DEBUG_LOG)
- If (DEBUG_LOG) Potential causes considered:
  1) care_exception table pre-exists in the Neon database from prior manual/testing work
  2) Migration was applied in another environment/branch against the same DB
  3) A partially created table/constraint exists due to earlier aborted runs
  4) Schema naming mismatch (public vs other schema) causing duplicate create
  5) Previous non-migration SQL created the table (e.g., via push or studio)
  6) Concurrent migration attempt created the table just before current run
  7) Drizzle meta journal not recording prior state for this DB
- If (DEBUG_LOG) Most likely sources: (1) Pre-existing table in Neon DB, (5) Prior push/studio/manual create
- If (DEBUG_LOG) Next validation step proposed: Run a read-only script to list tables/columns and verify care_exception structure matches expected before deciding resolution path

## Executor's Feedback or Assistance Requests

1) Migration resolution options (please choose one):
   - A) Non-destructive: Mark migration "0005_add-care-exception" as applied without changes after verifying the existing care_exception table matches the schema. I can create a small debug script in /debug to introspect the table (columns, types, defaults, constraints) and report. Then I will record the migration as applied. No data loss.
   - B) Destructive (only if safe): Drop the existing care_exception table in the Neon DB and re-run `bun --filter @repo/db migrate` so the migration applies cleanly. This removes any existing data in that table.
   - C) Conditional migration: Modify 0005 migration to conditionally create table/constraints using DO blocks to skip duplicates. More complex but preserves existing data.
   - D) Use `drizzle-kit push` for this environment to sync schema without migrations, then continue using migrations going forward (not ideal as it diverges migration history).

2) Commit strategy for pre-commit hook failure:
   - Option 1) Allow me to commit with `--no-verify` to bypass Husky this time
   - Option 2) I add a minimal placeholder test (e.g., tests/smoke.test.ts) so `bun test` passes, then commit normally
   - Option 3) Adjust Husky pre-commit to skip tests for now (tooling change)

3) Optional: Approve me to run a read-only DB inspection script (in /debug) that lists public tables and details of care_exception to validate current structure before we choose path A/B/C. This will help avoid surprises. I will not modify data.

Once the migration path and commit strategy are confirmed, I will:
- Complete DB step (apply or record migration as per choice)
- Proceed to Frontend wiring (replace mock data with tRPC, remove Escalate button, add Escalated badge/filter)
- Provide a UI preview before marking UI changes complete

## Current Status / Progress Tracking (Executor Mode Update)

- Read-only DB Diagnostics (care_exception join health)
  - Ran debug/inspect-care-exception.ts with enhanced checks
  - Findings:
    - FK exists: care_exception.patient_id -> patient.pat_id (constraint: care_exception_patient_id_patient_pat_id_fk)
    - Join health: total=19, matched=19, orphans=0
    - Sample joined rows show populated patient fields (e.g., last_name, first_name, mrn) for recent entries
    - Session parity info captured (current_database, user, host:port, timestamp) for comparison with API process
  - Interpretation: The active DB has proper FK integrity and patient records join correctly; the earlier report of 19 rows missing names/MRNs likely originated from either an earlier dataset without patient fields populated in the patient table or a different environment/connection string being used.

- Server-side API diagnostics (careException.list) - COMPLETED
  - Implemented: DEBUG_LOG-gated diagnostics inside <mcfile name="care-exception.ts" path="/Users/jamesyoung/Documents/sites/sophia2/sophia_v2/apps/api/routers/care-exception.ts"></mcfile> within the list procedure to log masked env summary, input params, query timing, join counts (total/matched/orphan-like), and a small sample of result shapes.
  - Key Finding: API correctly returns flat patient data structure (patientFirstName, patientLastName, patientMrnId) as expected by frontend
  - Debug Log Issue Identified: The DEBUG_LOG block was creating a misleading nested 'patient' object for logging purposes only, while the actual API response maintained the correct flat structure
  - Resolution: Disabled DEBUG_LOG in both API and frontend files to eliminate confusion
  - Verification: Direct API calls confirmed 19 total results with proper patient data structure
  - Status: API-Frontend data flow is working correctly; no structural issues found

- Todo updates
  - diag-fk-constraint: completed
  - diag-orphan-count: completed (0 orphans)
  - diag-patient-fields: completed (samples confirm populated fields)
  - diag-env-parity: completed (API confirmed returning correct data structure)
  - server-debug-log: completed (API structure verified, DEBUG_LOG disabled)
  - ui-debug-log: completed (Frontend structure verified, DEBUG_LOG disabled)

## Project Status Board (Updated)
- Care Exceptions Diagnostics - COMPLETED
  - [x] Verify FK exists: care_exception.patient_id -> patient.pat_id
  - [x] Compute orphaned care exceptions and sample values
  - [x] Sample matched rows to confirm patient fields
  - [x] Verify API server returns correct data structure to frontend
  - [x] Confirm API-Frontend data flow is working correctly
- PRDs Documentation - COMPLETED
  - [x] Added PRDs section to sidebar navigation
  - [x] Created Med Plan PRD page with comprehensive content

## Executor's Feedback or Assistance Requests (Next Step)

**DIAGNOSTICS COMPLETE** - All data flow verification tasks are finished. Key findings:
- API correctly returns flat patient data structure (patientFirstName, patientLastName, patientMrnId)
- Frontend receives and can access this data properly
- No structural mismatches between API and Frontend
- 19 care exception records with proper patient joins confirmed

**READY FOR FRONTEND WIRING** - Request approval to proceed with Step 3.A (Data integration and typing) from the original plan:
- Replace mock data with actual tRPC query results
- Remove "Escalate" button from UI
- Add "Escalated" badge/filter functionality
- Implement loading/empty/error states
- Add basic tests for new functionality

The diagnostic phase revealed that the API-Frontend data flow is already working correctly, so the frontend wiring should be straightforward.

## NEW REQUEST: Add PRDs Documentation Section (Planner Mode)

### Background and Motivation
- User requested adding a new group under documentation called "PRDs" (Product Requirements Documents)
- Need to organize product specifications and requirements in a structured, accessible way
- Should integrate with existing VitePress documentation structure

### Key Challenges and Analysis
- Documentation Structure: Ensure PRDs section fits cleanly into existing docs organization
- Navigation: Update VitePress config to include PRDs in sidebar/navigation
- Template Consistency: Create standardized PRD template for future documents
- Discoverability: Make PRDs easily findable from main documentation index

### Design Options Considered
1) Simple folder approach - Create `/docs/prds/` folder with individual markdown files
   - Pros: Simple, follows existing pattern, easy to maintain
   - Cons: May need manual navigation updates
2) VitePress category approach - Use VitePress built-in categorization
   - Pros: Automatic navigation, better UX
   - Cons: More complex setup
3) Separate documentation site - Dedicated PRD site
   - Pros: Complete separation of concerns
   - Cons: Overkill, maintenance overhead

### Plan of Record (Option 1 + VitePress integration)
- Create `/docs/prds/` directory structure
- Add PRDs section to VitePress navigation config
- Create index page for PRDs with overview and links
- Establish PRD template for consistency
- Update main docs index to reference PRDs section

### High-level Task Breakdown with Success Criteria
A) Create PRDs directory structure
   - Tasks: Create `/docs/prds/` folder and `index.md` with overview
   - Success: Directory exists, index page renders correctly
   - Files: `/docs/prds/index.md`

B) Update VitePress navigation
   - Tasks: Modify `.vitepress/config.ts` to include PRDs in sidebar
   - Success: PRDs section appears in documentation navigation
   - Files: `/docs/.vitepress/config.ts`

C) Create PRD template
   - Tasks: Create standardized PRD template with sections for requirements, user stories, acceptance criteria
   - Success: Template provides clear structure for future PRDs
   - Files: `/docs/prds/template.md`

D) Update main documentation index
   - Tasks: Add PRDs reference to main docs index page
   - Success: PRDs section is discoverable from main documentation
   - Files: `/docs/index.md`

### Testing Plan
- Verify VitePress builds without errors
- Check navigation links work correctly
- Ensure PRDs section is accessible and well-organized

### Risks & Mitigations
- Risk: VitePress config errors break documentation build
  Mitigation: Test build after each config change
- Risk: Navigation becomes cluttered
  Mitigation: Use clear, concise section naming

### Approval Request
- Please confirm to proceed with creating the PRDs documentation section in Executor mode, starting with Task A (Create PRDs directory structure)

## Lessons
- When join-derived fields appear empty in UI while the SQL join and FK integrity look correct, environment parity and runtime context are the most likely culprits. Adding bounded, gated logs server-side provides high-signal validation with minimal risk.