# 🚨 Troubleshooting Guide

Common issues and solutions for Sophia v2 healthcare platform development.

## 🔧 Development Issues

### **Port Already in Use**

**Problem:** Development server fails to start because port is occupied.

```bash
# Error message
Error: listen EADDRINUSE: address already in use :::5173
```

**Solutions:**

```bash
# Option 1: Kill process using the port
lsof -ti:5173 | xargs kill

# Option 2: Use a different port
bun dev --port 3000

# Option 3: Find and kill specific process
sudo lsof -i :5173
sudo kill -9 <PID>
```

### **Database Connection Failed**

**Problem:** Cannot connect to PostgreSQL database.

**Solutions:**

```bash
# Check database URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database

# Test database connection
bun debug:test-db-connection

# Check if database exists
psql $DATABASE_URL -c "SELECT version();"

# Reset database (CAUTION: destroys data)
bun --filter @repo/db drop
bun --filter @repo/db migrate
bun --filter @repo/db seed
```

### **TypeScript Compilation Errors**

**Problem:** TypeScript build fails with type errors.

**Solutions:**

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf .tsbuildinfo
bun install

# Regenerate route tree (TanStack Router)
bun --filter @repo/app generate:routes

# Check types without building
bun typecheck

# Fix common issues
bun --filter @repo/app build --no-emit
```

### **Dependency Installation Issues**

**Problem:** `bun install` fails or packages are missing.

**Solutions:**

```bash
# Clear lock file and node_modules
rm -rf node_modules bun.lock
bun install

# Check Bun version (requires 1.2+)
bun --version

# Try with fresh cache
bun install --no-cache

# Alternative: Use npm as fallback
npm install
```

## 🏥 Healthcare-Specific Issues

### **AI Agent Not Responding**

**Problem:** Genesis Agent or other AI agents not working.

**Solutions:**

```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# Test API connection
bun debug:genesis-pubmed

# Check rate limits
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Verify environment variables
grep -E "OPENAI|PUBMED" .env.local
```

### **Patient Data Not Loading**

**Problem:** Patient pool or care plans not displaying.

**Solutions:**

```bash
# Check database seeding
bun --filter @repo/db script:show-patients

# Verify database schema
bun --filter @repo/db studio

# Re-seed healthcare data
bun --filter @repo/db script:seed-patients
bun --filter @repo/db script:seed-care-plans

# Check API endpoint
curl http://localhost:8787/api/trpc/patient.list
```

### **Authentication Issues**

**Problem:** Login not working or session expired.

**Solutions:**

```bash
# Check auth configuration
echo $BETTER_AUTH_SECRET

# Test auth state
open debug/test-auth-state.html

# Clear session data
# In browser: Application -> Storage -> Clear All

# Regenerate auth secret
openssl rand -hex 32

# Check OAuth configuration
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

## 🚀 Build & Deployment Issues

### **Build Failures**

**Problem:** Production build fails.

**Solutions:**

```bash
# Check build individually
bun --filter @repo/app build
bun --filter @repo/edge build
bun --filter @repo/web build

# Clear all caches
bun clean
rm -rf dist/
rm -rf .next/
rm -rf node_modules/.cache

# Check for circular dependencies
bun check:circular

# Build with verbose output
bun build --verbose
```

### **Cloudflare Workers Deployment Issues**

**Problem:** Wrangler deployment fails.

**Solutions:**

```bash
# Check Wrangler authentication
wrangler whoami

# Re-authenticate
wrangler login

# Check configuration
cat apps/edge/wrangler.jsonc

# Deploy with verbose logging
wrangler deploy --compatibility-date=2024-01-01 --verbose

# Check secrets
wrangler secret list --env=production
```

### **Edge Function Errors**

**Problem:** API routes not working in production.

**Solutions:**

```bash
# Check worker logs
wrangler tail --env=production

# Test locally with wrangler
bun --filter @repo/edge build
wrangler dev

# Check environment variables
wrangler secret list

# Verify bundle size (must be < 1MB)
ls -la dist/
```

## 🗄️ Database Issues

### **Migration Failures**

**Problem:** Database migrations fail to apply.

**Solutions:**

```bash
# Check migration status
bun --filter @repo/db studio

# Apply migrations manually
bun --filter @repo/db migrate --force

# Rollback last migration
bun --filter @repo/db migrate:rollback

# Generate new migration
bun --filter @repo/db generate

# Check migration files
ls -la db/migrations/
```

### **Schema Sync Issues**

**Problem:** Database schema out of sync with code.

**Solutions:**

```bash
# Push schema changes
bun --filter @repo/db push

# Generate and apply migration
bun --filter @repo/db generate
bun --filter @repo/db migrate

# Reset database (CAUTION!)
bun --filter @repo/db drop
bun --filter @repo/db migrate
bun --filter @repo/db seed
```

### **UUID Extension Missing**

**Problem:** UUIDv7 functions not available.

**Solutions:**

```bash
# Install extensions manually
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS pg_uuidv7;"

# Run setup script
bun --filter @repo/db script:setup-extensions

# Test UUID generation
bun debug:test-uuid-functions

# Verify extension installation
psql $DATABASE_URL -c "SELECT * FROM pg_extension;"
```

## 🎨 UI & Component Issues

### **Tailwind Styles Not Working**

**Problem:** CSS classes not applying correctly.

**Solutions:**

```bash
# Check Tailwind configuration
cat apps/app/tailwind.config.css

# Verify content paths
grep -r "@source" apps/app/tailwind.config.css

# Clear Tailwind cache
rm -rf node_modules/.cache/@tailwindcss

# Rebuild styles
bun --filter @repo/app dev

# Check for conflicting styles
grep -r "!important" apps/app/styles/
```

### **shadcn/ui Component Issues**

**Problem:** UI components not rendering correctly.

**Solutions:**

```bash
# Check installed components
bun ui:list

# Reinstall component
bun ui:add button --overwrite

# Update all components
bun ui:update

# Check component configuration
cat apps/app/components.json

# Verify imports
grep -r "@repo/ui" apps/app/components/
```

### **Dark Mode Not Working**

**Problem:** Dark mode toggle not functioning.

**Solutions:**

```bash
# Check theme configuration
grep -r "dark:" apps/app/styles/

# Verify theme provider
grep -r "ThemeProvider" apps/app/

# Check CSS variables
grep -r "--background" apps/app/styles/

# Test theme switching
# In browser console: document.documentElement.classList.toggle('dark')
```

## 🔐 Security & Compliance Issues

### **HIPAA Compliance Warnings**

**Problem:** Security vulnerabilities detected.

**Solutions:**

```bash
# Run security audit
bun audit

# Check for vulnerable dependencies
bun audit --fix

# Scan for secrets in code
git secrets --scan

# Verify encryption settings
echo $DATA_ENCRYPTION_KEY

# Check audit logging
grep -r "audit" apps/api/lib/
```

### **Session Management Issues**

**Problem:** Users getting logged out unexpectedly.

**Solutions:**

```bash
# Check session configuration
grep -r "session" apps/api/lib/auth.ts

# Verify session storage
# In browser: Application -> Cookies

# Check session timeout settings
grep -r "maxAge\|duration" apps/api/lib/

# Test session persistence
open debug/test-session-structure.html
```

## 📱 Performance Issues

### **Slow Page Loading**

**Problem:** Application loading slowly.

**Solutions:**

```bash
# Analyze bundle size
bun --filter @repo/app analyze

# Check for large dependencies
bun why package-name

# Enable compression
# Add compression middleware to Hono

# Optimize images
# Use next/image or similar optimization

# Check network tab in browser DevTools
```

### **Memory Leaks**

**Problem:** Application consuming too much memory.

**Solutions:**

```bash
# Profile memory usage
# Use React DevTools Profiler

# Check for memory leaks
# Browser DevTools -> Memory tab

# Review useEffect cleanup
grep -r "useEffect.*return" apps/app/

# Check for circular references
bun check:circular
```

## 🌐 Network & API Issues

### **CORS Errors**

**Problem:** Cross-origin requests being blocked.

**Solutions:**

```bash
# Check CORS configuration
grep -r "cors" apps/api/

# Add CORS headers
# In Hono: app.use('*', cors())

# Verify allowed origins
echo $ALLOWED_ORIGINS

# Test with curl
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS http://localhost:8787/api/trpc
```

### **API Rate Limiting**

**Problem:** API requests being rate limited.

**Solutions:**

```bash
# Check rate limiting configuration
grep -r "rateLimit" apps/api/

# Verify API quotas
# OpenAI: https://platform.openai.com/usage
# PubMed: Check API key limits

# Implement exponential backoff
# Add retry logic with delays

# Monitor rate limit headers
curl -I https://api.openai.com/v1/models
```

## 🔍 Debugging Tools

### **Browser DevTools**

```javascript
// Useful debugging commands in browser console

// Check current user session
window.__auth_session__;

// View React component tree
window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

// Check TanStack Router state
window.__tanstack_router__;

// View Jotai atom values
window.__jotai_atoms__;
```

### **Server-Side Debugging**

```bash
# Enable debug logging
export DEBUG=*

# Check worker logs in real-time
wrangler tail --env=production

# Debug database queries
export DB_DEBUG=true

# Monitor API performance
export API_METRICS=true
```

### **Healthcare-Specific Debugging**

```bash
# Debug patient data flow
bun debug:patient-api

# Test care plan generation
bun debug:care-plans

# Verify AI agent responses
bun debug:genesis-agent

# Check compliance audit trails
bun debug:audit-logs
```

## 📞 Getting Help

### **Community Resources**

- **Discord**: [Join our Discord](https://discord.gg/2nKEnKq)
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: `bun docs:dev`

### **Professional Support**

- **Clinical Support**: healthcare@sophia-platform.com
- **Technical Support**: support@sophia-platform.com
- **Security Issues**: security@sophia-platform.com

### **Emergency Procedures**

For production issues affecting patient care:

1. **Immediate**: Contact on-call technical team
2. **Document**: Create incident report
3. **Notify**: Inform clinical stakeholders
4. **Follow-up**: Post-incident review and improvements

---

Remember: When dealing with healthcare applications, always prioritize patient safety and data security. If in doubt, escalate to the clinical team.
