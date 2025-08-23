# Task Creation Debug Guide

## Issues Fixed

### 1. Version Status Issue

**Problem**: The `versionStatus` field wasn't being properly handled when editing existing tasks.

**Root Cause**: The form was not validating that the `versionStatus` value from the database matched the allowed enum values.

**Fix**: Added validation in the `useEffect` to ensure the `versionStatus` is one of the valid enum values (`["draft", "active", "inactive"]`), with a fallback to `"active"`.

### 2. Wizard Navigation Issue

**Problem**: Users couldn't move to the second page of the task creation wizard.

**Root Cause**: Multiple issues:

- Missing route validation for search parameters
- No proper error handling for navigation failures
- Missing validation for required fields before navigation

**Fixes Applied**:

1. Added `validateSearch` to both route definitions to properly handle search parameters
2. Added validation for required fields before attempting navigation
3. Added error handling with user-friendly alerts
4. Improved logging for debugging navigation issues

### 3. API Schema Issues

**Problem**: TypeScript errors in the API due to incorrect Zod schema definitions.

**Fixes**:

- Fixed `z.record(z.any())` to `z.record(z.string(), z.any())` for proper key-value typing
- Added temporary organization ID fallback to prevent blocking errors

## Testing Steps

1. **Test Version Status Fix**:
   - Edit an existing task
   - Verify the version status dropdown shows the correct current value
   - Change the version status and save
   - Verify the change persists

2. **Test Wizard Navigation**:
   - Create a new task
   - Fill in basic information (Task ID, Name, Category)
   - Click "Next: Instructions"
   - Verify navigation to step 2 works
   - Fill in patient and clinician instructions
   - Click "Create Task"
   - Verify task is created successfully

3. **Test Error Handling**:
   - Try to navigate to step 2 without required fields
   - Verify appropriate error messages appear
   - Try to create a task with missing instructions
   - Verify validation works properly

## Key Changes Made

### apps/app/routes/task-management/create.tsx

- Added `validateSearch` for proper route parameter handling
- Enhanced form validation with enum value checking
- Improved error handling and user feedback
- Added navigation error handling

### apps/app/routes/task-management/create/instructions.tsx

- Added `validateSearch` for step1Data parameter
- Enhanced data validation before task creation
- Improved error messages and user feedback
- Added proper error handling for API calls

### apps/api/routers/task.ts

- Fixed Zod schema for conditions field
- Added temporary organization ID fallback
- Improved type safety

### apps/api/lib/task-storage.ts

- Added null checks for optional fields in mapping function
- Ensured consistent data structure

## Debugging Tips

If issues persist:

1. **Check Browser Console**: Look for navigation errors or API call failures
2. **Check Network Tab**: Verify API requests are being sent with correct data
3. **Check Server Logs**: Look for validation errors or database issues
4. **Verify Route Tree**: Ensure routes are properly generated with `bun run build:types`

## Next Steps

1. Implement proper organization context instead of hardcoded fallback
2. Add comprehensive form validation with better UX
3. Add loading states and progress indicators for the wizard
4. Consider adding a draft save feature for partially completed tasks
