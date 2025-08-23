# 🛠️ Development Setup

Complete guide to setting up your development environment for Sophia v2 healthcare platform development.

## 📋 Prerequisites

### Required Tools

#### **Bun Runtime** (v1.2+)

```bash
# Install Bun (replaces Node.js and npm)
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version  # Should be 1.2.0+
```

#### **VS Code** (Recommended IDE)

```bash
# Install VS Code with recommended extensions
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension ms-vscode.vscode-json
code --install-extension esbenp.prettier-vscode
```

#### **Cloudflare Account**

- Sign up at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up)
- Get your API token for deployment

#### **Database Access**

- **Neon PostgreSQL**: Sign up at [neon.tech](https://neon.tech)
- **Local PostgreSQL** (optional): For local development

### Optional Tools

```bash
# React Developer Tools (browser extension)
# Available for Chrome, Firefox, Edge

# PostgreSQL client (optional)
brew install postgresql  # macOS
sudo apt install postgresql-client  # Ubuntu
```

## 🚀 Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/sophia_v2.git
cd sophia_v2

# Install all dependencies
bun install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
code .env.local
```

**Required Environment Variables:**

```bash
# .env.local
DATABASE_URL="postgresql://username:password@host:port/database"
BETTER_AUTH_SECRET="your-random-secret-here"
OPENAI_API_KEY="your-openai-api-key"

# Cloudflare (for deployment)
CLOUDFLARE_API_TOKEN="your-cloudflare-token"
CLOUDFLARE_ZONE_ID="your-zone-id"
```

### 3. Database Setup

```bash
# Apply database migrations
bun --filter @repo/db migrate

# Seed sample healthcare data
bun --filter @repo/db seed
```

### 4. Start Development

```bash
# Start all development servers
bun dev

# Or start individual apps:
bun --filter @repo/app dev      # React app (localhost:5173)
bun --filter @repo/web dev      # Astro site (localhost:4321)

# Start API server (separate terminal)
bun --filter @repo/edge build --watch
bun wrangler dev
```

## 🏥 Healthcare-Specific Setup

### Medical Data Seeding

```bash
# Seed healthcare-specific data
bun --filter @repo/db script:seed-patients
bun --filter @repo/db script:seed-care-plans
bun --filter @repo/db script:seed-organizations
```

### AI Agent Configuration

```bash
# Configure AI integrations
export PUBMED_API_KEY="your-pubmed-key"
export CLINICAL_API_KEY="your-clinical-api-key"

# Test AI agent connections
bun debug:genesis-pubmed
bun debug:patient-api
```

### Healthcare Extensions Setup

```bash
# Install PostgreSQL healthcare extensions
bun --filter @repo/db script:setup-extensions

# Verify UUID v7 support
bun debug:test-uuid-functions
```

## 📁 Project Structure Understanding

```
sophia_v2/
├── apps/
│   ├── app/                   # React 19 healthcare frontend
│   │   ├── routes/            # Healthcare routes (patients, care plans, etc.)
│   │   ├── components/        # Healthcare UI components
│   │   └── lib/               # Auth, tRPC, utilities
│   ├── api/                   # Healthcare API server
│   │   ├── routers/           # tRPC routers for medical data
│   │   └── lib/               # Database, AI integrations
│   ├── edge/                  # Cloudflare Workers deployment
│   └── web/                   # Astro marketing site
├── packages/
│   ├── ui/                    # Healthcare UI component library
│   ├── core/                  # Shared healthcare types
│   └── ws-protocol/           # Real-time clinical communication
├── db/
│   ├── schema/                # Healthcare database schemas
│   ├── migrations/            # Database migration files
│   └── seeds/                 # Sample healthcare data
└── docs/                      # Comprehensive documentation
```

## 🔧 Development Workflow

### Daily Development

```bash
# Morning routine
git pull origin main           # Get latest changes
bun install                   # Update dependencies
bun --filter @repo/db migrate # Apply new migrations
bun dev                      # Start development

# During development
bun test                     # Run tests
bun typecheck               # Check TypeScript
bun lint                    # Check code quality

# Before committing
bun build                   # Test production build
bun test:coverage          # Verify test coverage
```

### Feature Development

```bash
# Create feature branch
git checkout -b feature/new-healthcare-feature

# Add UI components if needed
bun ui:add dialog card table

# Database changes
bun --filter @repo/db generate  # Generate migration
bun --filter @repo/db migrate   # Apply locally

# Test changes
bun test
bun typecheck
```

## 🏥 Healthcare Development Tools

### Database Management

```bash
# Open database GUI
bun --filter @repo/db studio

# Check database connection
bun debug:test-db-connection

# View patient data
bun --filter @repo/db script:show-patients

# Check care plans
bun --filter @repo/db script:show-care-plans
```

### AI Agent Testing

```bash
# Test Genesis Agent (evidence-based care)
bun debug:genesis-pubmed

# Test patient engagement
bun debug:patient-api

# Test compliance monitoring
bun debug:care-exception
```

### Clinical Data Debugging

```bash
# Debug authentication
open debug/test-auth-state.html

# Test session management
open debug/test-session-structure.html

# Check protected routes
open debug/test-protected-route.html
```

## 🔍 IDE Configuration

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🧪 Testing Setup

### Unit Testing

```bash
# Run all tests
bun test

# Run specific app tests
bun --filter @repo/app test
bun --filter @repo/api test

# Watch mode
bun test:watch

# Coverage report
bun test:coverage
```

### Healthcare Integration Tests

```bash
# Test clinical workflows
bun test:clinical

# Test AI agent integrations
bun test:ai-agents

# Test HIPAA compliance
bun test:compliance
```

## 🚀 Local Testing

### Testing Healthcare Features

```bash
# Test all healthcare components
bun test:healthcare

# Test AI agent integrations
bun test:ai-agents

# Test clinical workflows
bun test:clinical
```

### Local API Testing

```bash
# Start API server locally
bun --filter @repo/edge build --watch
bun wrangler dev

# Test API endpoints
curl http://localhost:8787/api/health
curl http://localhost:8787/api/trpc/patient.list
```

## 🔒 Security Setup

### HIPAA Compliance

```bash
# Enable audit logging
export HIPAA_AUDIT_MODE=true

# Configure encryption
export DATA_ENCRYPTION_KEY="your-encryption-key"

# Set up compliance monitoring
export COMPLIANCE_WEBHOOK_URL="your-webhook-url"
```

### Authentication

```bash
# Generate auth secret
openssl rand -hex 32

# Configure OAuth providers
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🚨 Troubleshooting

### Common Issues

#### **Port Already in Use**

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill

# Or use different port
bun dev --port 3000
```

#### **Database Connection Failed**

```bash
# Check database URL
echo $DATABASE_URL

# Test connection
bun debug:test-db-connection

# Reset database (caution!)
bun --filter @repo/db drop
bun --filter @repo/db migrate
```

#### **TypeScript Errors**

```bash
# Clear cache
rm -rf node_modules/.cache
bun install

# Regenerate types
bun --filter @repo/app generate:routes
bun typecheck
```

#### **Build Failures**

```bash
# Clear all caches
bun clean
bun install

# Individual builds
bun --filter @repo/app build
bun --filter @repo/edge build
```

### Getting Help

- **Documentation**: `bun docs:dev`
- **Discord**: [Join our Discord](https://discord.gg/2nKEnKq)
- **GitHub Issues**: Report bugs and feature requests
- **Clinical Support**: Contact healthcare@sophia-platform.com

## 🎯 Next Steps

Once your development environment is set up:

1. **Explore the Healthcare Features**: Visit `/healthcare-features`
2. **Learn About AI Agents**: Check out `/ai-agents`
3. **Understand the Architecture**: Read `/architecture-design`
4. **Try the Developer Reference**: Use `/developer-reference` for quick commands
5. **Ready for Production?**: See `/deployment-setup` for comprehensive deployment guide

Happy coding! 🚀
