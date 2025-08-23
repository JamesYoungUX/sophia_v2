# 📱 React Application Documentation

The Sophia v2 React application is a modern single-page application built with React 19 and TanStack Router, designed for building type-safe, performant healthcare user interfaces.

## 🛠️ Technology Stack

### Core Technologies

- **[React 19](https://react.dev/)** - Latest React with concurrent features for responsive UIs
- **[TanStack Router](https://tanstack.com/router)** - Type-safe routing with data loading
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking for runtime error prevention
- **[Vite](https://vitejs.dev/)** - Lightning-fast development server and optimized builds

### State Management & UI

- **[Jotai](https://jotai.org/)** - Atomic state management for scalable applications
- **[shadcn/ui](https://ui.shadcn.com/)** - Accessible component library built on Radix UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS with zero runtime
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication solution

### Why This Stack?

✅ **Performance First**: React 19's concurrent features + Vite's optimized builds  
✅ **Type Safety**: End-to-end TypeScript prevents runtime errors  
✅ **Developer Experience**: Hot reload, excellent tooling, intuitive APIs  
✅ **Scalability**: Atomic state management scales from simple to complex  
✅ **Accessibility**: Built-in accessibility with Radix UI primitives  
✅ **Maintainability**: Component ownership with copy-paste architecture

## 📁 Project Structure

```
apps/app/
├── components/              # Reusable UI components
│   ├── error.tsx              # Error boundary component
│   ├── layout.tsx             # Layout wrapper component
│   ├── stats-card.tsx         # Healthcare statistics display
│   ├── surgical-tracking-chart.tsx  # Medical data visualization
│   └── index.ts               # Component exports
├── lib/                     # Utility functions and configurations
│   ├── auth.ts                # Better Auth configuration
│   ├── auth-guard.ts          # Route protection utilities
│   ├── routeTree.gen.ts       # Generated route tree (auto-generated)
│   ├── store.ts               # Jotai atoms and global state
│   ├── trpc.ts                # tRPC client configuration
│   └── utils.ts               # Utility functions
├── public/                  # Static assets
│   ├── favicon.ico            # Application favicon
│   └── site.manifest         # PWA manifest
├── routes/                  # Healthcare application routes
│   ├── __root.tsx             # Root layout with navigation
│   ├── index.tsx              # Dashboard with medical stats
│   ├── about.tsx              # Platform overview
│   ├── account.tsx            # User profile management
│   ├── organization.tsx       # Multi-tenant organization setup
│   ├── agents/                # AI agent interfaces
│   │   ├── genesis-agent.tsx      # Evidence-based care optimization
│   │   ├── patient-engagement.tsx # Patient support AI
│   │   ├── compliance-agent.tsx   # Regulatory compliance
│   │   └── quantum-agent.tsx      # Analytics and predictions
│   ├── care-plans.tsx         # Care plan management
│   ├── patient-pool.tsx       # Patient database
│   ├── surgical-plan-view.tsx # Surgical workflow management
│   ├── task-management/       # Clinical task management
│   ├── care-exceptions/       # Exception handling
│   └── prds/                  # Product requirements documentation
├── styles/                  # Global styles and theme
│   └── globals.css            # Global CSS and healthcare theme variables
├── tests/                   # Test files
│   └── setup.ts               # Test configuration
├── index.html               # HTML template
├── index.tsx                # Application entry point
├── global.d.ts              # TypeScript global declarations
├── tailwind.config.css      # Tailwind CSS v4 configuration
├── vite.config.ts           # Vite configuration
└── components.json          # shadcn/ui configuration
```

## 🏥 Healthcare-Specific Features

### Dashboard Interface (`routes/index.tsx`)

- **Personalized Greetings**: Time-aware greetings with user names
- **Priority Tasks**: Clinical task overview with priority indicators
- **Medical Statistics**: Pre-operative and post-operative metrics
- **Surgical Tracking**: Visual progress charts and analytics

### AI Agent Interfaces (`routes/agents/`)

Each AI agent has a dedicated interface providing:

- **Real-time Learning Feeds**: Medical literature monitoring
- **Suggestion Management**: Evidence-based recommendations with clinical review
- **Audit Trails**: Comprehensive logging for regulatory compliance
- **Human-in-the-Loop**: Required physician approval workflows

### Clinical Data Management

- **Patient Pool**: Advanced patient database with risk assessment
- **Care Plans**: Hierarchical care plan system with version control
- **Task Management**: Clinical task prioritization and dependency tracking
- **Exception Handling**: Clinical exception documentation and resolution

## 🚦 Routing with TanStack Router

### File-Based Routing System

Healthcare routes are organized by clinical workflow:

```typescript
// routes/patient-pool.tsx - Patient management interface
export const Route = createFileRoute("/patient-pool")({
  beforeLoad: requireAuth, // Authentication required
  component: PatientPool,
  loader: async () => {
    // Pre-load patient data
    return await fetchPatients();
  },
});

// routes/care-plans.tsx - Care plan management
export const Route = createFileRoute("/care-plans")({
  beforeLoad: requireAuth,
  component: CarePlans,
  validateSearch: z.object({
    level: z.enum(["system", "organization", "team", "personal"]).optional(),
    status: z.enum(["active", "inactive", "draft"]).optional(),
  }),
});
```

### Authentication Guard

All healthcare routes are protected with authentication:

```typescript
// lib/auth-guard.ts
export async function requireAuth({ context }: { context: any }) {
  const session = await auth.getSession();
  if (!session) {
    throw redirect({ to: "/login" });
  }
  return { session };
}
```

### Navigation Patterns

```tsx
import { Link, useNavigate } from "@tanstack/react-router";

// Declarative navigation with type safety
<Link
  to="/care-plans"
  search={{ level: "organization", status: "active" }}
  className="healthcare-nav-link"
>
  Organization Care Plans
</Link>;

// Programmatic navigation
const navigate = useNavigate();
navigate({
  to: "/patient-pool",
  search: { riskLevel: "high" },
});
```

## 🏪 State Management with Jotai

### Healthcare-Specific Atoms

```typescript
// lib/store.ts - Healthcare state management
import { atom } from "jotai";

// Patient management state
export const selectedPatientAtom = atom<Patient | null>(null);
export const patientFiltersAtom = atom({
  riskLevel: null as RiskLevel | null,
  provider: null as string | null,
  surgery: null as string | null,
});

// Care plan state
export const activeCarePlanAtom = atom<CarePlan | null>(null);
export const carePlanModificationsAtom = atom<Modification[]>([]);

// AI agent state
export const aiSuggestionsAtom = atom<AISuggestion[]>([]);
export const pendingReviewsAtom = atom((get) =>
  get(aiSuggestionsAtom).filter((s) => s.status === "pending"),
);

// Organization context
export const activeOrganizationAtom = atom<Organization | null>(null);
export const activeTeamAtom = atom<Team | null>(null);
```

### Clinical Workflow State

```tsx
import { useAtom } from "jotai";
import { selectedPatientAtom, patientFiltersAtom } from "@/lib/store";

function PatientManagement() {
  const [selectedPatient, setSelectedPatient] = useAtom(selectedPatientAtom);
  const [filters, setFilters] = useAtom(patientFiltersAtom);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    // Trigger care plan loading, risk assessment, etc.
  };

  return (
    <div className="patient-management">
      <PatientFilters filters={filters} onChange={setFilters} />
      <PatientList onSelect={handlePatientSelect} />
      {selectedPatient && <PatientDetails patient={selectedPatient} />}
    </div>
  );
}
```

## 🎨 Healthcare UI Components

### Medical Data Visualization

```tsx
// components/stats-card.tsx - Medical statistics display
interface StatsCardProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    color: "completed" | "pending" | "cancelled";
  }>;
  total: number;
}

function StatsCard({ title, data, total }: StatsCardProps) {
  return (
    <Card className="healthcare-stats">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{/* Medical data visualization */}</CardContent>
    </Card>
  );
}
```

### Clinical Component Library

```tsx
import { Button, Card, Dialog, Badge, Table, Pagination } from "@repo/ui";

// Healthcare-specific component usage
function ClinicalInterface() {
  return (
    <div className="clinical-layout">
      <Card className="patient-card">
        <Badge variant="destructive">High Risk</Badge>
        <Table className="medical-data-table">{/* Patient data */}</Table>
      </Card>

      <Dialog>
        <Button variant="medical-primary">Update Care Plan</Button>
      </Dialog>
    </div>
  );
}
```

## 🎨 Healthcare Design System

### Medical Theme Configuration

```css
/* tailwind.config.css - Healthcare theme */
@import "tailwindcss";

@source "./routes/**/*.{ts,tsx}";
@source "./components/**/*.{ts,tsx}";
@source "../../packages/ui/components/**/*.{ts,tsx}";

@theme inline {
  /* Healthcare color palette */
  --color-medical-primary: oklch(0.5 0.2 220);
  --color-medical-secondary: oklch(0.7 0.15 200);
  --color-risk-high: oklch(0.6 0.25 0);
  --color-risk-medium: oklch(0.7 0.15 60);
  --color-risk-low: oklch(0.7 0.15 120);

  /* Clinical status colors */
  --color-status-completed: oklch(0.6 0.15 120);
  --color-status-pending: oklch(0.7 0.15 60);
  --color-status-cancelled: oklch(0.6 0.15 0);
}
```

### Clinical CSS Variables

```css
/* styles/globals.css - Healthcare theme variables */
:root {
  /* Light mode - Clinical environment */
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.15 0 0);
  --medical-primary: oklch(0.2 0.1 220);
  --medical-accent: oklch(0.85 0.05 200);

  /* Risk level indicators */
  --risk-high: oklch(0.6 0.25 0);
  --risk-medium: oklch(0.7 0.15 60);
  --risk-low: oklch(0.7 0.15 120);
}

.dark {
  /* Dark mode - After-hours clinical */
  --background: oklch(0.05 0 0);
  --foreground: oklch(0.95 0 0);
  --medical-primary: oklch(0.7 0.1 220);
  --medical-accent: oklch(0.2 0.05 200);
}

/* Healthcare-specific utility classes */
.medical-card {
  @apply bg-background border border-medical-accent rounded-lg p-4;
}

.risk-indicator {
  @apply inline-flex items-center px-2 py-1 text-xs font-medium rounded-full;
}

.risk-high {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}
```

## 🔒 Authentication & Security

### Better Auth Integration

```typescript
// lib/auth.ts - Healthcare authentication
import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  // HIPAA-compliant session management
  sessionConfig: {
    duration: 8 * 60 * 60, // 8 hours for clinical shifts
    maxAge: 12 * 60 * 60, // 12 hours absolute max
  },
});

export const { useSession, signIn, signOut } = auth;
```

### Protected Healthcare Routes

```typescript
// All clinical routes require authentication
export const Route = createFileRoute("/(clinical)")({
  beforeLoad: async ({ context }) => {
    const session = await auth.getSession();
    if (!session?.user) {
      throw redirect({ to: "/login" });
    }

    // Verify active organization context for multi-tenant
    const activeOrg = session.activeOrganization;
    if (!activeOrg) {
      throw redirect({ to: "/organization" });
    }

    return { session, activeOrg };
  },
});
```

## 🔗 API Integration with tRPC

### Healthcare API Client

```typescript
// lib/trpc.ts - Type-safe healthcare API
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@repo/api";

export const api = createTRPCReact<AppRouter>();

// Healthcare-specific hooks
export const usePatients = () => api.patient.list.useQuery();
export const useCarePlans = () => api.carePlan.list.useQuery();
export const useAISuggestions = () => api.genesis.suggestions.useQuery();
```

### Clinical Data Fetching

```tsx
function ClinicalDashboard() {
  const { data: patients, isLoading: patientsLoading } =
    api.patient.list.useQuery({
      filters: { riskLevel: "high" },
    });

  const { data: suggestions } = api.genesis.suggestions.useQuery();

  const createCarePlan = api.carePlan.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch care plans
      api.carePlan.list.invalidate();
    },
  });

  if (patientsLoading) return <ClinicalSkeleton />;

  return (
    <div className="clinical-dashboard">
      <PatientRiskOverview patients={patients} />
      <AISuggestionsList suggestions={suggestions} />
    </div>
  );
}
```

## 🧪 Testing Healthcare Components

### Unit Testing Clinical Components

```typescript
// components/PatientCard.test.tsx
import { render, screen } from "@testing-library/react";
import { PatientCard } from "./PatientCard";

const mockHighRiskPatient = {
  id: "patient-1",
  name: "John Doe",
  riskLevel: "High" as const,
  surgery: "Cardiac Surgery",
  age: 65
};

test("displays high risk indicator for high risk patients", () => {
  render(<PatientCard patient={mockHighRiskPatient} />);

  expect(screen.getByText("High Risk")).toBeInTheDocument();
  expect(screen.getByTestId("risk-indicator")).toHaveClass("risk-high");
});

test("shows surgical procedure information", () => {
  render(<PatientCard patient={mockHighRiskPatient} />);

  expect(screen.getByText("Cardiac Surgery")).toBeInTheDocument();
});
```

### Healthcare Integration Tests

```typescript
// routes/CarePlans.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/lib/routeTree.gen";

test("loads organization care plans correctly", async () => {
  const router = createMemoryRouter({
    routes: routeTree,
    initialLocation: "/care-plans?level=organization",
  });

  render(<RouterProvider router={router} />);

  await waitFor(() => {
    expect(screen.getByText("Organization Care Plans")).toBeInTheDocument();
  });

  // Verify care plan data loading
  expect(screen.getByText("Hypertension Management")).toBeInTheDocument();
  expect(screen.getByText("Diabetes Care Protocol")).toBeInTheDocument();
});
```

## 🚀 Performance Optimization

### Healthcare-Specific Optimizations

```typescript
// Lazy load heavy medical components
const SurgicalPlanView = lazy(() => import("./routes/surgical-plan-view"));
const PatientDataGrid = lazy(() => import("./components/PatientDataGrid"));

// Virtual scrolling for large patient lists
import { FixedSizeList as List } from "react-window";

function VirtualPatientList({ patients }: { patients: Patient[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <PatientCard patient={patients[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={patients.length}
      itemSize={120}
      className="virtual-patient-list"
    >
      {Row}
    </List>
  );
}
```

### Medical Data Caching

```typescript
// lib/trpc.ts - Healthcare data caching strategies
export const api = createTRPCReact<AppRouter>({
  defaultOptions: {
    queries: {
      // Patient data - cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Care plans - cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      // Retry failed requests (important for clinical data)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

## 🔧 Build & Deployment

### Healthcare-Optimized Build

```bash
# Production build with healthcare optimizations
bun build

# Analyze bundle for medical dependencies
bun analyze

# Build with HIPAA compliance checks
bun build:secure
```

### Environment Configuration

```bash
# .env.local - Healthcare environment
VITE_API_URL=https://api.healthcare-platform.com
VITE_APP_NAME="Sophia Healthcare Platform"
VITE_HIPAA_MODE=true
VITE_AUDIT_ENDPOINT=https://audit.healthcare-platform.com
```

## 📚 Healthcare Development Best Practices

### Clinical Data Handling

1. **Always validate medical data** at component boundaries
2. **Implement proper error boundaries** for clinical workflows
3. **Use TypeScript strictly** for patient data types
4. **Cache medical data appropriately** (not too long, not too short)
5. **Handle loading states gracefully** in clinical interfaces

### Accessibility for Healthcare

1. **High contrast support** for clinical environments
2. **Keyboard navigation** for hands-free operation
3. **Screen reader compatibility** for visually impaired staff
4. **Large touch targets** for mobile clinical use

### Security Considerations

1. **Never log patient data** in console or error tracking
2. **Sanitize all medical inputs** to prevent XSS
3. **Implement proper session timeout** for clinical shifts
4. **Use HTTPS everywhere** for HIPAA compliance

---

This React application provides a robust foundation for healthcare applications, combining modern web technologies with healthcare-specific requirements for security, accessibility, and clinical workflow optimization.
