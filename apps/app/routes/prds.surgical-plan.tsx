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
        <h1 className="text-3xl font-bold tracking-tight">Surgical Care Plan Platform</h1>
        <p className="text-muted-foreground">
          Product Requirements Document
        </p>
      </div>

      <div className="grid gap-6">
        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The Surgical Care Plan Platform is a comprehensive digital solution that enables healthcare providers to create, customize, and manage pre-operative and post-operative care plans for patients undergoing various surgical procedures. The platform provides standardized yet flexible care pathways that can be tailored to specific surgeries, patient needs, and provider preferences.
            </p>
          </CardContent>
        </Card>

        {/* Problem Statement */}
        <Card>
          <CardHeader>
            <CardTitle>Problem Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Current Challenges</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>Inconsistent Care Delivery:</strong> Lack of standardized pre-op and post-op protocols across different surgeries and providers</li>
                <li><strong>Patient Confusion:</strong> Patients receive scattered information across multiple touchpoints without a clear, organized plan</li>
                <li><strong>Provider Inefficiency:</strong> Manual creation of care plans for each patient and surgery type</li>
                <li><strong>Poor Compliance Tracking:</strong> Difficulty monitoring patient adherence to pre-op and post-op instructions</li>
                <li><strong>Communication Gaps:</strong> Limited visibility into patient progress between appointments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Goals</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Standardize surgical care pathways while maintaining flexibility for customization</li>
                <li>Improve patient outcomes through better preparation and recovery adherence</li>
                <li>Reduce provider administrative burden</li>
                <li>Enhance patient-provider communication throughout the surgical journey</li>
                <li>Enable data-driven insights for continuous care improvement</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Target Users */}
        <Card>
          <CardHeader>
            <CardTitle>Target Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Primary Users</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>Surgeons:</strong> Create and customize surgical care plans</li>
                <li><strong>Surgical Coordinators:</strong> Manage patient enrollment and plan assignment</li>
                <li><strong>Nurses:</strong> Monitor patient progress and provide guidance</li>
                <li><strong>Patients:</strong> Follow their personalized care plans</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Secondary Users</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>Hospital Administrators:</strong> Oversee care quality and operational efficiency</li>
                <li><strong>Anesthesiologists:</strong> Review pre-op readiness</li>
                <li><strong>Physical Therapists:</strong> Contribute to post-op recovery plans</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Success Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Clinical Outcomes</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><strong>Patient Readiness Score:</strong> % of patients meeting pre-op requirements on surgery day</li>
                  <li><strong>Complication Reduction:</strong> Decrease in preventable post-op complications by 25%</li>
                  <li><strong>Recovery Time:</strong> Reduction in average recovery time by 15%</li>
                  <li><strong>Patient Satisfaction:</strong> Achievement of 90%+ satisfaction scores</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Operational Metrics</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><strong>Plan Creation Efficiency:</strong> 80% reduction in time to create new care plans</li>
                  <li><strong>Patient Engagement:</strong> 85%+ completion rate for care plan activities</li>
                  <li><strong>Provider Adoption:</strong> 90%+ of eligible surgeries using the platform within 6 months</li>
                  <li><strong>Communication Efficiency:</strong> 60% reduction in patient calls related to care instructions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Agent Architecture */}
        <Card>
          <CardHeader>
            <CardTitle>AI Agent Architecture</CardTitle>
            <CardDescription>
              Five specialized AI agents working in collaboration to ensure optimal patient care and outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Sophia (Patient Engagement Agent)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Core Mission:</strong> The compassionate digital companion that builds trust and ensures every patient feels supported throughout their surgical journey.
              </p>
              <div className="ml-4">
                <h5 className="font-medium mb-1">Key Capabilities:</h5>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><strong>Multi-channel Communication:</strong> Orchestrates SMS, app, email, and phone interactions</li>
                  <li><strong>Personalized Education:</strong> Delivers surgery-specific information in accessible formats</li>
                  <li><strong>Cultural & Language Adaptation:</strong> Supports multiple languages, reading levels, and cultural preferences</li>
                  <li><strong>Emotional Support:</strong> Provides encouragement and addresses patient concerns with empathy</li>
                  <li><strong>Proactive Monitoring:</strong> Checks in with patients and identifies barriers to care plan adherence</li>
                  <li><strong>Intelligent Escalation:</strong> Coordinates with other agents when issues require immediate attention</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-primary">Genesis Agent</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Core Mission:</strong> Evidence-based care plan optimization through continuous learning from medical literature and real-world outcomes.
              </p>
              <div className="ml-4">
                <h5 className="font-medium mb-1">Key Capabilities:</h5>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><strong>Literature Monitoring:</strong> Ingests new clinical guidelines, research, and best practices</li>
                  <li><strong>Plan Evolution:</strong> Suggests updates to care protocols based on emerging evidence</li>
                  <li><strong>Human-in-the-Loop:</strong> All suggestions require clinician review and approval</li>
                  <li><strong>Version Control:</strong> Maintains audit trails of plan changes and their rationale</li>
                  <li><strong>Cross-Institution Learning:</strong> Shares validated improvements across healthcare networks</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-primary">Compliance Agent</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Core Mission:</strong> Automated monitoring and intervention to ensure patients stay on track with their care requirements.
              </p>
              <div className="ml-4">
                <h5 className="font-medium mb-1">Key Capabilities:</h5>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><strong>Real-time Monitoring:</strong> Tracks adherence to medications, appointments, and care activities</li>
                  <li><strong>Smart Escalation:</strong> Implements tiered intervention protocols (patient reminders → care team alerts)</li>
                  <li><strong>Exception Handling:</strong> Accounts for hospitalizations, complications, or other care disruptions</li>
                  <li><strong>Risk Stratification:</strong> Prioritizes interventions based on patient risk profiles and compliance history</li>
                  <li><strong>Audit Documentation:</strong> Maintains comprehensive logs for quality assurance and regulatory compliance</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-primary">Care Coordination Agent</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Core Mission:</strong> Seamless orchestration of resources, scheduling, and logistics across the surgical care continuum.
              </p>
              <div className="ml-4">
                <h5 className="font-medium mb-1">Key Capabilities:</h5>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><strong>Resource Management:</strong> Coordinates transportation, equipment, and facility needs</li>
                  <li><strong>Insurance Verification:</strong> Validates coverage and identifies financial barriers</li>
                  <li><strong>Multi-disciplinary Coordination:</strong> Aligns schedules across surgical teams, anesthesia, nursing, and support services</li>
                  <li><strong>Emergency Problem-Solving:</strong> Rapidly addresses logistical issues that could impact care delivery</li>
                  <li><strong>Integration Management:</strong> Connects with external systems (EMRs, scheduling platforms, transportation services)</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-primary">Quantum Agent</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Core Mission:</strong> Advanced analytics and outcome optimization through comprehensive data analysis and predictive insights.
              </p>
              <div className="ml-4">
                <h5 className="font-medium mb-1">Key Capabilities:</h5>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><strong>Outcome Analytics:</strong> Tracks patient progress and identifies patterns in recovery trajectories</li>
                  <li><strong>Cost-Effectiveness Analysis:</strong> Measures value-based care metrics and identifies cost reduction opportunities</li>
                  <li><strong>Predictive Modeling:</strong> Identifies patients at risk for complications or non-adherence</li>
                  <li><strong>Quality Improvement:</strong> Detects gaps in care delivery and suggests process improvements</li>
                  <li><strong>Population Health Insights:</strong> Aggregates data across patient cohorts to inform care standardization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Functional Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Functional Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Care Plan Template Management (Enhanced by Genesis Agent)</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Evidence-Based Templates:</strong> Pre-built templates continuously updated based on latest clinical evidence</li>
                  <li><strong>Custom Templates:</strong> Organization-specific templates that build upon evidence-based foundations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}