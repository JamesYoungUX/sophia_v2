# 🚀 Deployment Setup

Complete guide to deploying Sophia v2 healthcare platform to production environments with Cloudflare Workers and edge computing.

## 🎯 Deployment Overview

Sophia v2 is designed for **edge-first deployment** using Cloudflare Workers, providing:

- **Global distribution** for low-latency healthcare applications
- **HIPAA-compliant infrastructure** with enterprise security
- **Scalable architecture** handling healthcare workloads
- **Cost-effective** serverless computing model

## 📋 Prerequisites

### Required Accounts & Access

#### **Cloudflare Account**

- Sign up at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up)
- Add your domain to Cloudflare
- Get API token with Zone:Edit permissions

#### **Database Access**

- **Neon PostgreSQL**: Production database at [neon.tech](https://neon.tech)
- **Connection pooling** enabled for high availability

#### **External Services**

- **OpenAI API**: For AI agent functionality
- **PubMed API**: For medical literature access
- **Healthcare APIs**: Any integrated clinical systems

### Required Tools

```bash
# Wrangler CLI (Cloudflare Workers)
bun add -g wrangler

# Verify installation
wrangler --version  # Should be 3.0+

# Login to Cloudflare
wrangler login
```

## 🔧 Environment Configuration

### Production Environment Variables

Create production environment file:

```bash
# .env.production
# Database
DATABASE_URL="postgresql://user:password@production-host:5432/sophia_v2"
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000

# Authentication
BETTER_AUTH_SECRET="your-secure-production-secret-64-chars"
BETTER_AUTH_URL="https://your-domain.com"

# AI Services
OPENAI_API_KEY="your-production-openai-key"
PUBMED_API_KEY="your-pubmed-api-key"

# Healthcare Compliance
HIPAA_AUDIT_MODE=true
DATA_ENCRYPTION_KEY="your-aes-256-encryption-key"
COMPLIANCE_WEBHOOK_URL="https://your-compliance-monitoring.com/webhook"

# Cloudflare
CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
CLOUDFLARE_ZONE_ID="your-zone-id"

# External Integrations
CLINICAL_API_URL="https://your-clinical-system.com/api"
CLINICAL_API_KEY="your-clinical-api-key"

# Monitoring & Logging
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"
METRICS_ENDPOINT="https://your-metrics-service.com"
```

### Staging Environment

```bash
# .env.staging
DATABASE_URL="postgresql://user:password@staging-host:5432/sophia_v2_staging"
BETTER_AUTH_URL="https://staging.your-domain.com"
# ... other staging-specific variables
```

## 🏗️ Cloudflare Workers Setup

### 1. Configure Wrangler

Update `apps/edge/wrangler.jsonc`:

```jsonc
{
  "name": "sophia-v2-api",
  "main": "dist/index.js",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],

  "vars": {
    "ENVIRONMENT": "production",
    "LOG_LEVEL": "info",
  },

  "env": {
    "staging": {
      "name": "sophia-v2-api-staging",
      "vars": {
        "ENVIRONMENT": "staging",
      },
    },
    "production": {
      "name": "sophia-v2-api-production",
      "vars": {
        "ENVIRONMENT": "production",
      },
    },
  },

  "routes": [
    {
      "pattern": "api.your-domain.com/*",
      "zone_name": "your-domain.com",
    },
  ],

  "limits": {
    "cpu_ms": 50000,
  },
}
```

### 2. Set Production Secrets

```bash
# Set all production secrets
wrangler secret put DATABASE_URL --env=production
wrangler secret put BETTER_AUTH_SECRET --env=production
wrangler secret put OPENAI_API_KEY --env=production
wrangler secret put PUBMED_API_KEY --env=production
wrangler secret put DATA_ENCRYPTION_KEY --env=production
wrangler secret put COMPLIANCE_WEBHOOK_URL --env=production
wrangler secret put CLINICAL_API_KEY --env=production

# Verify secrets are set
wrangler secret list --env=production
```

### 3. Deploy API Workers

```bash
# Build and deploy to staging
bun --filter @repo/edge build
wrangler deploy --env=staging

# Deploy to production
wrangler deploy --env=production

# Verify deployment
curl https://api.your-domain.com/health
```

## 🌐 Frontend Deployment

### Cloudflare Pages Setup

#### **React App Deployment**

```bash
# Build React app for production
bun --filter @repo/app build

# Deploy to Cloudflare Pages
wrangler pages deploy apps/app/dist --project-name=sophia-v2-app

# Configure custom domain
wrangler pages project create sophia-v2-app
wrangler pages project domain add sophia-v2-app your-domain.com
```

#### **Astro Marketing Site**

```bash
# Build Astro site
bun --filter @repo/web build

# Deploy marketing site
wrangler pages deploy apps/web/dist --project-name=sophia-v2-web
```

### Environment Variables for Pages

```bash
# Set React app environment variables
wrangler pages secret put VITE_API_URL --project-name=sophia-v2-app
wrangler pages secret put VITE_AUTH_URL --project-name=sophia-v2-app
```

## 🗄️ Database Deployment

### Production Database Setup

#### **Neon PostgreSQL Configuration**

```bash
# Create production database
# Via Neon console: https://console.neon.tech

# Apply migrations to production
DATABASE_URL="your-production-db-url" bun --filter @repo/db migrate

# Verify database schema
DATABASE_URL="your-production-db-url" bun --filter @repo/db studio
```

#### **Database Security Configuration**

```sql
-- Create read-only user for monitoring
CREATE USER sophia_monitor WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE sophia_v2 TO sophia_monitor;
GRANT USAGE ON SCHEMA public TO sophia_monitor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sophia_monitor;

-- Create application user with limited permissions
CREATE USER sophia_app WITH PASSWORD 'secure-app-password';
GRANT CONNECT ON DATABASE sophia_v2 TO sophia_app;
GRANT USAGE, CREATE ON SCHEMA public TO sophia_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sophia_app;
```

#### **Connection Pooling**

```bash
# Configure connection pooling in production
export DATABASE_POOL_SIZE=10
export DATABASE_POOL_TIMEOUT=30000
export DATABASE_IDLE_TIMEOUT=600000
```

## 🔒 Security Configuration

### HIPAA Compliance Setup

```bash
# Enable comprehensive audit logging
export HIPAA_AUDIT_MODE=true
export AUDIT_LOG_RETENTION_DAYS=2555  # 7 years for HIPAA

# Configure data encryption
export DATA_ENCRYPTION_ALGORITHM=AES-256-GCM
export DATA_ENCRYPTION_KEY="your-256-bit-encryption-key"

# Set up access controls
export RBAC_ENABLED=true
export SESSION_TIMEOUT=1800  # 30 minutes
export MAX_LOGIN_ATTEMPTS=3
```

### SSL/TLS Configuration

```bash
# Configure Cloudflare SSL
# Set SSL mode to "Full (strict)" in Cloudflare dashboard

# Enable HSTS
export HSTS_MAX_AGE=31536000
export HSTS_INCLUDE_SUBDOMAINS=true

# Configure secure headers
export CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
```

## 📊 Monitoring & Logging

### Application Monitoring

#### **Cloudflare Analytics**

```bash
# Enable Cloudflare Web Analytics
# Add analytics token to your pages

# Configure custom metrics
export CLOUDFLARE_ANALYTICS_TOKEN="your-analytics-token"
```

#### **Error Tracking with Sentry**

```bash
# Configure Sentry for error tracking
export SENTRY_DSN="your-sentry-dsn"
export SENTRY_ENVIRONMENT="production"
export SENTRY_TRACES_SAMPLE_RATE=0.1

# Set up performance monitoring
export SENTRY_PERFORMANCE_MONITORING=true
```

### Healthcare-Specific Monitoring

```bash
# Patient data access monitoring
export PATIENT_ACCESS_LOGGING=true
export PHI_ACCESS_ALERTS=true

# Clinical system integration monitoring
export CLINICAL_API_MONITORING=true
export CLINICAL_ALERT_THRESHOLD=5000  # ms

# Care plan performance tracking
export CARE_PLAN_METRICS=true
export AI_AGENT_PERFORMANCE_TRACKING=true
```

## 🚀 Deployment Process

### Automated Deployment Pipeline

#### **GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test

      - name: Type check
        run: bun typecheck

      - name: Build applications
        run: |
          bun --filter @repo/app build
          bun --filter @repo/edge build
          bun --filter @repo/web build

      - name: Deploy API to Cloudflare Workers
        run: wrangler deploy --env=production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Deploy React App to Cloudflare Pages
        run: wrangler pages deploy apps/app/dist --project-name=sophia-v2-app
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Manual Deployment Steps

```bash
# 1. Pre-deployment checks
bun test                    # All tests pass
bun typecheck              # No TypeScript errors
bun lint                   # Code quality checks
bun build                  # Production build succeeds

# 2. Database migration (if needed)
DATABASE_URL="production-url" bun --filter @repo/db migrate

# 3. Deploy API
bun --filter @repo/edge build
wrangler deploy --env=production

# 4. Deploy frontend
bun --filter @repo/app build
wrangler pages deploy apps/app/dist --project-name=sophia-v2-app

# 5. Verify deployment
curl https://api.your-domain.com/health
curl https://your-domain.com

# 6. Monitor for issues
wrangler tail --env=production
```

## 🔄 Backup & Disaster Recovery

### Database Backup Strategy

```bash
# Automated daily backups (configure in Neon dashboard)
# - Point-in-time recovery enabled
# - Cross-region backup replication
# - 30-day backup retention minimum

# Manual backup for critical updates
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Test backup restoration
createdb sophia_v2_test
psql sophia_v2_test < backup-file.sql
```

### Application Recovery

```bash
# Rollback deployment if issues detected
wrangler deployments list --env=production
wrangler rollback --deployment-id=<previous-deployment-id> --env=production

# Database rollback (if needed)
DATABASE_URL="production-url" bun --filter @repo/db migrate:rollback
```

## 🎛️ Performance Optimization

### Cloudflare Optimization

```bash
# Enable Cloudflare optimizations
# - Auto Minify (CSS, JS, HTML)
# - Rocket Loader
# - Image Optimization
# - Bandwidth Alliance

# Configure caching rules
# API responses: Cache for 5 minutes
# Static assets: Cache for 1 year
# Patient data: No cache (privacy)
```

### Database Performance

```bash
# Production database tuning
# - Connection pooling enabled
# - Query optimization
# - Index optimization for healthcare queries
# - Partitioning for large patient datasets

# Monitor query performance
DATABASE_URL="production-url" bun debug:slow-queries
```

## 📈 Scaling Configuration

### Auto-scaling Settings

```bash
# Configure Cloudflare Workers scaling
# - CPU limit: 50ms (increase for AI operations)
# - Memory limit: 128MB
# - Concurrent requests: 1000+

# Database scaling (Neon)
# - Auto-scaling enabled
# - Read replicas for reporting
# - Connection pooling optimization
```

### Load Testing

```bash
# Load testing before production
bun test:load

# Monitor during high traffic
wrangler tail --env=production --format=pretty

# Healthcare-specific load patterns
# - Patient check-in spikes
# - Care plan generation load
# - AI agent query bursts
```

## 🚨 Troubleshooting Deployment

### Common Deployment Issues

#### **Build Failures**

```bash
# Check build logs
bun build --verbose

# Clear caches
bun clean
rm -rf node_modules
bun install

# Verify dependencies
bun check:dependencies
```

#### **Worker Deployment Fails**

```bash
# Check bundle size (must be < 1MB)
ls -la apps/edge/dist/

# Verify wrangler configuration
wrangler validate apps/edge/wrangler.jsonc

# Check compatibility flags
wrangler deploy --dry-run --env=production
```

#### **Database Connection Issues**

```bash
# Test database connectivity
DATABASE_URL="production-url" bun debug:test-db-connection

# Check SSL configuration
psql "$DATABASE_URL?sslmode=require"

# Verify connection pooling
DATABASE_URL="production-url" bun debug:connection-pool
```

### Production Monitoring

```bash
# Real-time logs
wrangler tail --env=production

# Error rate monitoring
curl https://api.your-domain.com/metrics

# Database performance
DATABASE_URL="production-url" bun debug:db-metrics

# Healthcare-specific metrics
curl https://api.your-domain.com/health/clinical
```

## 📞 Support & Emergency Procedures

### Emergency Contacts

- **Technical Emergency**: support@sophia-platform.com
- **Clinical Emergency**: clinical@sophia-platform.com
- **Security Incident**: security@sophia-platform.com

### Incident Response

For production issues affecting patient care:

1. **Immediate Response**: Activate incident response team
2. **Assessment**: Determine impact on patient safety
3. **Communication**: Notify clinical stakeholders
4. **Resolution**: Implement fix or rollback
5. **Documentation**: Complete incident report
6. **Review**: Post-incident analysis and improvements

### 24/7 Monitoring

```bash
# Set up alerting for critical issues
# - API response time > 5 seconds
# - Error rate > 1%
# - Database connection failures
# - Patient data access anomalies
# - AI agent service disruptions
```

---

**Remember**: Healthcare applications require extra attention to security, compliance, and availability. Always prioritize patient safety and data protection in all deployment decisions.

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**: Set up comprehensive monitoring
2. **Security Audit**: Regular security assessments
3. **Backup Testing**: Verify backup and recovery procedures
4. **User Training**: Train healthcare staff on the platform
5. **Compliance Review**: Regular HIPAA compliance audits

Your Sophia v2 healthcare platform is now ready to serve patients and healthcare providers with enterprise-grade reliability! 🏥✨
