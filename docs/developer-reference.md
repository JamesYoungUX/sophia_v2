# 🔧 Developer Reference

Quick reference guide for Sophia v2 development, including commands, configuration, and best practices.

## 🚀 Quick Start Commands

### Essential Development Commands

```bash
# Project Setup
bun install                     # Install all dependencies
bun dev                        # Start all development servers

# Individual App Development
bun --filter @repo/app dev     # React app (localhost:5173)
bun --filter @repo/web dev     # Astro site (localhost:4321)
bun --filter @repo/edge build --watch && bun wrangler dev  # API server
```

### Database Operations

```bash
# Database Management
bun --filter @repo/db migrate  # Apply database migrations
bun --filter @repo/db push     # Push schema changes to database
bun --filter @repo/db studio   # Open Drizzle Studio (database GUI)
bun --filter @repo/db seed     # Seed sample data

# Database Scripts
bun --filter @repo/db generate # Generate new migration
bun --filter @repo/db drop     # Drop database (caution!)
```

### UI Component Management

```bash
# shadcn/ui Component Management
bun ui:add button dialog        # Add specific components
bun ui:essentials              # Install 37 essential components
bun ui:list                    # List installed components
bun ui:update                  # Update all components
bun ui:remove button           # Remove specific component
```

### Testing & Quality

```bash
# Testing
bun test                       # Run all tests
bun test:watch                 # Run tests in watch mode
bun test:coverage              # Generate coverage report
bun --filter @repo/app test    # Test specific app
bun --filter @repo/api test    # Test API

# Code Quality
bun lint                       # Lint all code
bun lint:fix                   # Fix linting errors
bun typecheck                  # TypeScript type checking
bun format                     # Format code with Prettier
```

### Build & Deployment

```bash
# Production Build
bun build                      # Build all apps
bun --filter @repo/app build   # Build React app
bun --filter @repo/web build   # Build Astro site
bun --filter @repo/edge build  # Build API

# Deployment
bun wrangler deploy --env=production  # Deploy to Cloudflare Workers
bun deploy:web                 # Deploy Astro site
bun deploy:docs                # Deploy documentation
```

### Documentation

```bash
# Documentation Development
bun docs:dev                   # Start VitePress docs server
bun docs:build                 # Build static documentation
bun docs:preview               # Preview built documentation
bun docs:deploy                # Deploy docs to GitHub Pages
```

## 🏗️ Project Structure

```
sophia_v2/
├── apps/
│   ├── app/                   # React 19 frontend
│   │   ├── components/        # UI components
│   │   ├── routes/           # TanStack Router pages
│   │   ├── lib/              # Utilities and configurations
│   │   └── styles/           # Global styles
│   ├── web/                  # Astro marketing site
│   ├── api/                  # tRPC API server
│   └── edge/                 # Cloudflare Workers entry
├── packages/
│   ├── core/                 # Shared types and utilities
│   ├── ui/                   # Shared UI components
│   └── ws-protocol/          # WebSocket protocols
├── db/                       # Database schemas and migrations
├── docs/                     # VitePress documentation
├── debug/                    # Debug and testing scripts
└── scripts/                  # Build and utility scripts
```

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# .env.local (not committed to git)
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-auth-secret"
OPENAI_API_KEY="your-openai-key"

# Cloudflare Workers
CLOUDFLARE_API_TOKEN="your-cf-token"
CLOUDFLARE_ZONE_ID="your-zone-id"

# Optional: Healthcare APIs
PUBMED_API_KEY="your-pubmed-key"
EHR_INTEGRATION_URL="your-ehr-endpoint"
```

### Development Tools Setup

```bash
# Required Tools
bun --version                  # Should be 1.2.0+
wrangler --version            # Cloudflare Workers CLI
psql --version                # PostgreSQL client (optional)

# VS Code Extensions (recommended)
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
```

## 🎯 Development Workflows

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/new-healthcare-feature

# 2. Start development servers
bun dev

# 3. Generate database changes (if needed)
bun --filter @repo/db generate

# 4. Add UI components (if needed)
bun ui:add card dialog

# 5. Run tests
bun test

# 6. Type check
bun typecheck

# 7. Commit changes
git add . && git commit -m "feat: add new healthcare feature"
```

### Database Schema Changes

```bash
# 1. Modify schema files in db/schema/
# 2. Generate migration
bun --filter @repo/db generate

# 3. Review generated migration in db/migrations/
# 4. Apply migration to local database
bun --filter @repo/db migrate

# 5. Test changes
bun --filter @repo/db studio

# 6. Seed test data (if needed)
bun --filter @repo/db seed
```

### AI Agent Development

```bash
# Debug AI agent integrations
bun debug:genesis-pubmed       # Test PubMed integration
bun debug:care-exception       # Test exception handling
bun debug:patient-api          # Test patient API

# Literature ingestion testing
bun scripts:ingest-literature  # Manual literature update
bun scripts:validate-evidence  # Validate evidence quality
```

## 🔍 Debugging & Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connection
bun debug:test-db-connection

# Reset database (caution!)
bun --filter @repo/db drop
bun --filter @repo/db migrate
bun --filter @repo/db seed
```

#### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
bun install

# Regenerate route tree
bun --filter @repo/app generate:routes

# Check types without building
bun typecheck
```

#### Build Failures

```bash
# Clear all build caches
bun clean
bun install

# Individual app builds
bun --filter @repo/app build
bun --filter @repo/edge build
```

#### Authentication Issues

```bash
# Debug authentication state
open debug/test-auth-state.html

# Check session structure
open debug/test-session-structure.html

# Debug protected routes
open debug/test-protected-route.html
```

### Performance Profiling

```bash
# Bundle analysis
bun --filter @repo/app analyze

# Build performance
bun build --profile

# Memory usage
bun --filter @repo/app build --analyze
```

## 🧪 Testing Strategies

### Unit Testing

```javascript
// Example unit test
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

test("button renders correctly", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});
```

### Integration Testing

```javascript
// Example API integration test
import { createTRPCMsw } from "msw-trpc";
import { appRouter } from "@repo/api";

const trpcMsw = createTRPCMsw(appRouter);

test("patient data fetching", async () => {
  const handlers = [
    trpcMsw.patient.list.query(() => {
      return mockPatients;
    }),
  ];
  // Test implementation
});
```

### E2E Testing

```bash
# Run Playwright tests
bun test:e2e

# Run specific test suite
bun test:e2e --grep "patient management"

# Debug mode
bun test:e2e --debug
```

## 📚 Code Conventions

### TypeScript Best Practices

```typescript
// Use strict typing
interface Patient {
  readonly id: string;
  name: string;
  birthDate: Date;
  riskLevel: "High" | "Medium" | "Low";
}

// Prefer type guards
function isHighRiskPatient(
  patient: Patient,
): patient is Patient & { riskLevel: "High" } {
  return patient.riskLevel === "High";
}

// Use branded types for IDs
type PatientId = string & { readonly brand: unique symbol };
```

### React Patterns

```tsx
// Prefer function components with hooks
function PatientCard({ patient }: { patient: Patient }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return <Card>{/* Component implementation */}</Card>;
}

// Use proper error boundaries
function PatientManagement() {
  return (
    <ErrorBoundary>
      <PatientList />
    </ErrorBoundary>
  );
}
```

### API Design

```typescript
// tRPC router example
export const patientRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Implementation
    }),

  create: protectedProcedure
    .input(createPatientSchema)
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),
});
```

## 🔧 Advanced Configuration

### Cloudflare Workers Setup

```toml
# wrangler.toml
name = "sophia-v2-api"
main = "dist/index.js"
compatibility_date = "2024-01-01"

[env.production]
name = "sophia-v2-api-prod"
vars = { NODE_ENV = "production" }

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

### Database Configuration

```typescript
// drizzle.config.ts
export default {
  schema: "./schema/*",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun build
      - run: bun deploy
```

## 📖 Additional Resources

### Documentation Links

- [React 19 Documentation](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Better Auth](https://www.better-auth.com/)

### Healthcare Standards

- [HL7 FHIR](https://www.hl7.org/fhir/)
- [HIPAA Compliance](https://www.hhs.gov/hipaa/)
- [DICOM Standards](https://www.dicomstandard.org/)

### AI/ML Resources

- [OpenAI API](https://platform.openai.com/docs)
- [PubMed API](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [Clinical Guidelines](https://www.guideline.gov/)

---

**Pro Tips:**

- Use `bun dev` for the fastest development experience
- Always run `bun typecheck` before committing
- Keep your `.env.local` file secure and never commit it
- Use the database studio (`bun --filter @repo/db studio`) for debugging data issues
- Leverage the AI agents' audit trails for debugging clinical workflows
