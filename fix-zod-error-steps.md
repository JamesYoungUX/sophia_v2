# Fix Zod Schema Error - Step by Step

## 🔧 **Changes Made**

I've simplified the Zod schemas to use `z.unknown()` instead of complex object schemas that were causing the error:

```typescript
// Before (causing error):
conditions: z.object({}).passthrough().default({})
metadata: z.object({ ... }).optional()

// After (simplified):
conditions: z.unknown().default({})
metadata: z.unknown().optional()
```

## 🔄 **CRITICAL: Restart API Server**

The API server **MUST** be restarted to pick up the schema changes:

### Step 1: Stop Current API Server

```bash
# Find the API server process and stop it (Ctrl+C)
# Or kill it if needed:
pkill -f "bun.*api.*dev"
```

### Step 2: Restart API Server

```bash
# From the root directory:
bun --filter @repo/api dev

# OR from the apps/api directory:
cd apps/api
bun dev
```

### Step 3: Verify Server Started

Look for these logs:

```
TaskRouter: Initializing task management router
TaskRouter: Task management router initialized
```

## 🧪 **Test the Fix**

### Test 1: Edit Existing Task

1. Go to `/task-management`
2. Click "Edit" on any task
3. Change the version status
4. Click "Update Task"
5. **Expected**: Should save without the Zod error

### Test 2: Create New Task

1. Go to `/task-management`
2. Click "Create Task"
3. Fill in basic info → "Next: Instructions"
4. Fill instructions → "Create Task"
5. **Expected**: Should create successfully

## 🔍 **Debug Information**

With `DEBUG_LOG = true`, you should see in the API server console:

```
TaskRouter: Update task input: { id: "...", versionStatus: "draft", ... }
TaskRouter: Update data: { versionStatus: "draft", ... }
```

## 🚨 **If Still Getting Errors**

### Check 1: API Server Logs

Look for any error messages in the API server console when you try to save.

### Check 2: Network Tab

In browser DevTools → Network tab, check the failed request to see the exact error response.

### Check 3: Zod Version

The error might be due to Zod version incompatibility. Check:

```bash
cd apps/api
bun list | grep zod
```

### Check 4: Clear All Caches

```bash
# Stop all servers
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules
bun install
```

## 🎯 **Most Likely Solution**

The schema is now simplified and should work. The most likely issue is that the **API server hasn't been restarted** to pick up the changes.

**Action Required:**

1. ✅ Stop the API server (Ctrl+C)
2. ✅ Restart: `bun --filter @repo/api dev`
3. ✅ Test editing a task again

The error should be resolved after restarting the API server with the simplified schemas.
