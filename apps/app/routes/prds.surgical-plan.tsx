import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'

export const Route = createFileRoute('/prds/surgical-plan')({
  beforeLoad: requireAuth,
  component: SurgicalPlanPRD,
})

function SurgicalPlanPRD() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Surgical Plan PRD</h1>
        <p className="text-muted-foreground">
          Product Requirements Document for Surgical Plan Management
        </p>
      </div>

      <div className="grid gap-6">
        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              High-level summary of the surgical plan management feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Purpose</h4>
              <p className="text-sm text-muted-foreground">
                Enable healthcare providers to create, manage, and track comprehensive surgical plans for patients,
                ensuring coordinated surgical care delivery and improved patient outcomes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Target Users</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Primary Care Physicians</li>
                <li>Specialists</li>
                <li>Care Coordinators</li>
                <li>Nursing Staff</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Section */}
        <Card>
          <CardHeader>
            <CardTitle>Functional Requirements</CardTitle>
            <CardDescription>
              Core functionality and features for surgical plan management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Plan Creation</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Create new surgical plans with patient demographics</li>
                  <li>Define surgical goals and objectives</li>
                  <li>Set pre-operative and post-operative schedules</li>
                  <li>Assign surgical team members and responsibilities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Plan Management</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Edit and update existing surgical plans</li>
                  <li>Track surgical progress and milestones</li>
                  <li>Document surgical plan modifications and rationale</li>
                  <li>Archive completed or cancelled surgical plans</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Collaboration</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Share surgical plans with surgical team members</li>
                  <li>Enable collaborative editing and surgical notes</li>
                  <li>Notify surgical stakeholders of plan updates</li>
                  <li>Maintain audit trail of all surgical plan changes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Requirements</CardTitle>
            <CardDescription>
              System requirements and technical specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Data Storage</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>HIPAA-compliant data encryption at rest and in transit</li>
                  <li>Structured data format for interoperability</li>
                  <li>Automated backup and disaster recovery</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Integration</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>EHR system integration via HL7 FHIR</li>
                  <li>Patient portal synchronization</li>
                  <li>Billing system integration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Sub-second response times for plan retrieval</li>
                  <li>Support for concurrent users (100+ simultaneous)</li>
                  <li>99.9% uptime availability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Success Metrics</CardTitle>
            <CardDescription>
              Key performance indicators and success criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">User Adoption</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>80% of providers actively using the system within 3 months</li>
                  <li>Average of 5+ plans created per provider per week</li>
                  <li>User satisfaction score of 4.5/5 or higher</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Clinical Outcomes</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>15% reduction in care coordination errors</li>
                  <li>20% improvement in treatment adherence</li>
                  <li>10% reduction in average length of stay</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Timeline</CardTitle>
            <CardDescription>
              Development phases and key milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-semibold">Phase 1: Foundation (Weeks 1-4)</h4>
                <p className="text-sm text-muted-foreground">
                  Database schema design, API development, basic CRUD operations
                </p>
              </div>
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-semibold">Phase 2: Core Features (Weeks 5-8)</h4>
                <p className="text-sm text-muted-foreground">
                  Plan creation UI, care team assignment, basic collaboration features
                </p>
              </div>
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-semibold">Phase 3: Advanced Features (Weeks 9-12)</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time collaboration, notifications, reporting and analytics
                </p>
              </div>
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-semibold">Phase 4: Integration & Testing (Weeks 13-16)</h4>
                <p className="text-sm text-muted-foreground">
                  EHR integration, comprehensive testing, user training, deployment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}