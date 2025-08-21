import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'

export const Route = createFileRoute('/prds/sophia-patient-engagement')({
  beforeLoad: requireAuth,
  component: SophiaPatientEngagementPRD,
})

function SophiaPatientEngagementPRD() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Sophia - Patient Engagement Agent</h1>
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
            <p className="text-sm text-muted-foreground mb-4">
              Sophia is the Patient Engagement Agent that serves as the compassionate digital companion for surgical patients throughout their entire care journey. More than just a chatbot, Sophia embodies empathy, cultural sensitivity, and intelligent healthcare guidance. She proactively engages patients across multiple communication channels, provides personalized education and support, monitors patient wellbeing, and coordinates with other AI agents to ensure seamless care delivery.
            </p>
          </CardContent>
        </Card>

        {/* Agent Mission & Persona */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Mission & Persona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Core Mission</h4>
                <p className="text-sm text-muted-foreground">
                  To make healthcare personal, proactive, and empowering by ensuring every patient feels seen, heard, and supported throughout their surgical journey.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Sophia's Persona</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Compassionate:</strong> Always leads with empathy and understanding</li>
                  <li><strong>Culturally Aware:</strong> Adapts communication style to patient's cultural background and preferences</li>
                  <li><strong>Proactively Helpful:</strong> Anticipates needs and reaches out before problems arise</li>
                  <li><strong>Trustworthy:</strong> Builds confidence through consistent, reliable interactions</li>
                  <li><strong>Learning-Oriented:</strong> Continuously improves based on patient feedback and outcomes</li>
                  <li><strong>Collaborative:</strong> Works seamlessly with other agents and human care team members</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Voice & Tone Guidelines</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Warm but Professional:</strong> Friendly without being overly casual</li>
                  <li><strong>Clear & Accessible:</strong> Uses plain language appropriate to patient's education level</li>
                  <li><strong>Encouraging:</strong> Celebrates progress and motivates during challenging times</li>
                  <li><strong>Respectful:</strong> Acknowledges patient autonomy and cultural values</li>
                  <li><strong>Calm in Crisis:</strong> Maintains composure during urgent situations while escalating appropriately</li>
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
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">1. Multi-Channel Communication Engine</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Requirement:</strong> Sophia must engage patients across their preferred communication channels with consistent personality and context.
                </p>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Capabilities:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li><strong>SMS Messaging:</strong> Rich text with emoji support, image sharing, quick reply buttons</li>
                    <li><strong>Mobile App Chat:</strong> Real-time messaging with multimedia support and offline message queuing</li>
                    <li><strong>Email:</strong> Formatted newsletters, appointment reminders, and educational content</li>
                    <li><strong>Voice Calls:</strong> Natural language processing for phone-based interactions</li>
                    <li><strong>Push Notifications:</strong> Timely alerts with customizable frequency settings</li>
                    <li><strong>Web Portal Chat:</strong> Browser-based conversations with session continuity</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Technical Requirements:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Unified conversation history across all channels</li>
                    <li>Context preservation when switching between channels</li>
                    <li>Message delivery status tracking and retry logic</li>
                    <li>Channel preference learning and optimization</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">2. Conversational Intelligence System</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Requirement:</strong> Natural, contextually-aware conversations that understand patient intent, emotion, and medical context.
                </p>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Capabilities:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li><strong>Natural Language Understanding:</strong> Intent recognition for healthcare-specific queries</li>
                    <li><strong>Sentiment Analysis:</strong> Detection of anxiety, confusion, pain, or distress in patient communications</li>
                    <li><strong>Medical Context Awareness:</strong> Understanding of surgical procedures, medications, and care plan terminology</li>
                    <li><strong>Multi-turn Conversation Management:</strong> Maintaining context across extended conversations</li>
                    <li><strong>Clarification Requests:</strong> Asking follow-up questions when patient intent is unclear</li>
                    <li><strong>Conversation Summarization:</strong> Providing care team with key conversation insights</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Technical Requirements:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Large language model fine-tuned for healthcare conversations</li>
                    <li>Real-time sentiment scoring with threshold-based escalation</li>
                    <li>Integration with medical terminology databases (SNOMED CT, ICD-10)</li>
                    <li>Conversation state management and memory persistence</li>
                    <li>Fallback mechanisms for unrecognized inputs</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">3. Personalization & Adaptation Engine</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Requirement:</strong> Sophia learns and adapts to each patient's unique communication preferences, cultural background, and care needs.
                </p>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Capabilities:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li><strong>Communication Style Adaptation:</strong> Adjusting formality, length, and frequency based on patient preferences</li>
                    <li><strong>Language & Cultural Sensitivity:</strong> Multi-language support with cultural context awareness</li>
                    <li><strong>Learning Disabilities Support:</strong> Simplified language, visual aids, and audio options for patients with cognitive challenges</li>
                    <li><strong>Accessibility Features:</strong> Screen reader compatibility, high contrast modes, and voice-to-text capabilities</li>
                    <li><strong>Timing Optimization:</strong> Learning optimal communication times based on patient response patterns</li>
                    <li><strong>Content Personalization:</strong> Tailoring educational materials to patient's procedure, risk factors, and interests</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">4. Patient Education & Guidance System</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Requirement:</strong> Deliver personalized, accessible education about surgical procedures, recovery expectations, and self-care instructions.
                </p>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Capabilities:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li><strong>Procedure-Specific Education:</strong> Tailored content for different surgical types (orthopedic, cardiac, general, etc.)</li>
                    <li><strong>Interactive Learning Modules:</strong> Quizzes, videos, and step-by-step guides</li>
                    <li><strong>Visual Aid Generation:</strong> Diagrams, animations, and infographics explaining medical concepts</li>
                    <li><strong>Progress-Based Content:</strong> Educational materials that evolve based on patient's recovery stage</li>
                    <li><strong>FAQ & Myth-Busting:</strong> Addressing common misconceptions and concerns</li>
                    <li><strong>Family Education:</strong> Content designed for patient's support network</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">5. Proactive Monitoring & Outreach System</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Requirement:</strong> Anticipate patient needs and proactively reach out to provide support, collect information, or address potential issues.
                </p>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Capabilities:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li><strong>Milestone-Based Check-ins:</strong> Automated outreach at key points in the care journey</li>
                    <li><strong>Risk-Based Monitoring:</strong> Increased engagement for high-risk patients</li>
                    <li><strong>Adherence Tracking:</strong> Monitoring medication compliance, appointment attendance, and care plan activities</li>
                    <li><strong>Symptom Monitoring:</strong> Regular collection of patient-reported outcomes and symptoms</li>
                    <li><strong>Mood & Wellbeing Tracking:</strong> Emotional health monitoring with mental health resource connections</li>
                    <li><strong>Pre-emptive Problem Solving:</strong> Identifying and addressing barriers before they impact care</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">6. Crisis Detection & Escalation System</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Requirement:</strong> Immediately identify urgent medical situations or patient distress and coordinate appropriate interventions.
                </p>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Capabilities:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li><strong>Emergency Symptom Recognition:</strong> Detecting descriptions of serious complications or medical emergencies</li>
                    <li><strong>Mental Health Crisis Detection:</strong> Identifying signs of severe depression, anxiety, or suicidal ideation</li>
                    <li><strong>Pain Management Escalation:</strong> Recognizing inadequate pain control or medication issues</li>
                    <li><strong>Social Determinant Alerts:</strong> Identifying barriers like transportation, housing, or financial problems</li>
                    <li><strong>Care Gap Identification:</strong> Flagging missed appointments, medications, or critical care steps</li>
                    <li><strong>Multi-Agent Coordination:</strong> Triggering responses from Care Coordination, Compliance, or clinical teams</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">7. Care Team Collaboration Interface</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Requirement:</strong> Seamlessly share patient insights, concerns, and progress with human care team members while maintaining appropriate AI agent coordination.
                </p>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Capabilities:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li><strong>Clinical Summaries:</strong> Automated generation of patient interaction summaries for providers</li>
                    <li><strong>Alert Prioritization:</strong> Intelligent triage of patient concerns requiring clinical attention</li>
                    <li><strong>Handoff Management:</strong> Smooth transitions between AI and human care team interactions</li>
                    <li><strong>Documentation Integration:</strong> Automatic logging of relevant conversations in patient records</li>
                    <li><strong>Provider Preferences:</strong> Learning individual provider communication styles and priorities</li>
                    <li><strong>Multi-disciplinary Coordination:</strong> Sharing insights across nursing, social work, pharmacy, and other specialties</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Collaboration Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Collaboration Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Inter-Agent Communication Protocols</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Sophia's Role in Agent Ecosystem:</strong>
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4 mb-4">
                  <li><strong>Primary Patient Interface:</strong> Serves as main communication channel between patient and all other agents</li>
                  <li><strong>Context Provider:</strong> Shares patient insights, preferences, and concerns with other agents</li>
                  <li><strong>Escalation Coordinator:</strong> Routes issues to appropriate specialized agents</li>
                  <li><strong>Feedback Collector:</strong> Gathers patient responses to interventions suggested by other agents</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Collaboration Interfaces</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">With Genesis Agent:</h5>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      <li>Delivers care plan updates and educational content suggested by Genesis</li>
                      <li>Collects patient feedback on new protocols or interventions</li>
                      <li>Reports patient comprehension and acceptance of evidence-based recommendations</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">With Compliance Agent:</h5>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      <li>Receives alerts about missed medications or appointments for patient follow-up</li>
                      <li>Provides context about barriers to compliance (transportation, side effects, etc.)</li>
                      <li>Confirms patient understanding of compliance requirements</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">With Care Coordination Agent:</h5>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      <li>Requests resource assistance (transportation, equipment, scheduling)</li>
                      <li>Provides patient preferences and constraints for coordination activities</li>
                      <li>Confirms successful resolution of logistical issues</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">With Quantum Agent:</h5>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      <li>Provides patient-reported outcomes and subjective experience data</li>
                      <li>Reports patient concerns that may indicate developing complications</li>
                      <li>Shares engagement patterns that may predict adherence or outcomes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Non-Functional Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Non-Functional Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Performance Standards</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Response Time:</strong> Less than 2 seconds for simple queries, less than 5 seconds for complex medical questions</li>
                  <li><strong>Availability:</strong> 99.9% uptime with graceful degradation during maintenance</li>
                  <li><strong>Scalability:</strong> Support 50,000+ concurrent patient conversations</li>
                  <li><strong>Multi-language Processing:</strong> Less than 3 seconds additional latency for translation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Security & Privacy</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>HIPAA Compliance:</strong> All conversations encrypted and logged per healthcare requirements</li>
                  <li><strong>Data Minimization:</strong> Only collect and retain conversation data necessary for care delivery</li>
                  <li><strong>Access Controls:</strong> Role-based permissions for care team access to patient conversations</li>
                  <li><strong>Audit Trails:</strong> Complete logging of all patient interactions and agent decisions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Reliability & Safety</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Clinical Safety:</strong> All medical advice reviewed by clinical team before delivery</li>
                  <li><strong>Fallback Protocols:</strong> Human handoff available when AI cannot address patient needs</li>
                  <li><strong>Crisis Response:</strong> Less than 30 seconds to escalate emergency situations to human care team</li>
                  <li><strong>Error Handling:</strong> Graceful recovery from technical failures without losing conversation context</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Accessibility & Inclusion</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Language Support:</strong> Spanish, English initially, expandable to 10+ languages</li>
                  <li><strong>Reading Level:</strong> Automatic adjustment from 6th grade to college level based on patient needs</li>
                  <li><strong>Disability Support:</strong> Full screen reader compatibility, voice interface for motor impairments</li>
                  <li><strong>Cultural Competency:</strong> Training data includes diverse patient populations and cultural contexts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Success Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Patient Engagement Metrics</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Response Rate:</strong> 85%+ patients respond to Sophia's initial outreach</li>
                  <li><strong>Conversation Depth:</strong> Average 4+ message exchanges per conversation</li>
                  <li><strong>Channel Utilization:</strong> Balanced usage across preferred communication channels</li>
                  <li><strong>Session Return Rate:</strong> 70%+ of patients initiate conversations with Sophia</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Patient Satisfaction Metrics</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Trust Score:</strong> 90%+ patients report trusting Sophia's guidance</li>
                  <li><strong>Helpfulness Rating:</strong> 4.5/5 average rating for conversation helpfulness</li>
                  <li><strong>Cultural Sensitivity:</strong> 95%+ satisfaction across diverse patient populations</li>
                  <li><strong>Problem Resolution:</strong> 80%+ of patient concerns resolved through Sophia interactions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Clinical Impact Metrics</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Adherence Improvement:</strong> 25% increase in care plan compliance through Sophia engagement</li>
                  <li><strong>Early Problem Detection:</strong> 15% reduction in emergency interventions through proactive monitoring</li>
                  <li><strong>Provider Efficiency:</strong> 30% reduction in routine patient calls to clinical staff</li>
                  <li><strong>Patient Preparation:</strong> 90%+ of patients arrive prepared for appointments and procedures</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Technical Performance Metrics</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li><strong>Conversation Success Rate:</strong> 95%+ conversations completed without technical escalation</li>
                  <li><strong>Intent Recognition Accuracy:</strong> 90%+ correct interpretation of patient requests</li>
                  <li><strong>Sentiment Analysis Accuracy:</strong> 85%+ correct identification of patient emotional state</li>
                  <li><strong>Crisis Detection Sensitivity:</strong> 98%+ identification of true emergency situations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment & Mitigation */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment & Mitigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">High-Risk Areas</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Medical Misinformation Risk</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Risk:</strong> Sophia provides incorrect medical advice or contradicts clinical recommendations
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Mitigation:</strong> Clinical review of all medical content, clear limitations messaging, immediate escalation for complex medical questions
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Patient Over-Dependence Risk</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Risk:</strong> Patients rely solely on Sophia instead of contacting clinical team for serious issues
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Mitigation:</strong> Regular reminders about human care team availability, crisis escalation protocols, clear scope limitations
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Cultural Insensitivity Risk</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Risk:</strong> Sophia's responses offend or exclude certain cultural groups
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Mitigation:</strong> Diverse training data, cultural advisory board review, ongoing bias testing, patient feedback integration
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Privacy Breach Risk</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Risk:</strong> Sensitive patient conversations exposed through technical vulnerabilities
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Mitigation:</strong> End-to-end encryption, regular security audits, minimal data retention, staff training on privacy protocols
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Medium-Risk Areas</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Technology Dependency Risk</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Risk:</strong> Patients unable to access care information during system outages
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Mitigation:</strong> Offline content caching, alternative communication channels, graceful degradation protocols
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Language Barrier Risk</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Risk:</strong> Limited language support excludes non-English speaking patients
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Mitigation:</strong> Priority development of Spanish support, professional translation services, cultural liaison partnerships
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Phase 1: Core Conversational Foundation (Months 1-3)</h4>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Deliverables:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Basic conversational AI with healthcare context understanding</li>
                    <li>SMS and mobile app communication channels</li>
                    <li>English-language support with basic personalization</li>
                    <li>Integration with master platform for patient data access</li>
                    <li>Clinical safety protocols and escalation procedures</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Success Criteria:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>90%+ intent recognition accuracy in controlled testing</li>
                    <li>Successful pilot with 100 patients across 2 surgical types</li>
                    <li>Zero safety incidents during pilot period</li>
                    <li>80%+ patient satisfaction in initial user testing</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Phase 2: Advanced Intelligence & Multi-Channel Support (Months 4-6)</h4>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Deliverables:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Sentiment analysis and emotional intelligence capabilities</li>
                    <li>Email and voice call support with conversation continuity</li>
                    <li>Spanish language support with cultural context</li>
                    <li>Proactive monitoring and milestone-based outreach</li>
                    <li>Integration with other AI agents for collaborative care</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Success Criteria:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>85%+ sentiment analysis accuracy</li>
                    <li>Successful deployment across 5 surgical practices</li>
                    <li>Multi-agent collaboration demonstrated in real patient scenarios</li>
                    <li>25% improvement in patient adherence metrics</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Phase 3: Predictive Intelligence & Personalization (Months 7-9)</h4>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Deliverables:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Advanced personalization with learning algorithms</li>
                    <li>Crisis detection and emergency escalation systems</li>
                    <li>Accessibility features for patients with disabilities</li>
                    <li>Predictive outreach based on risk factors and care patterns</li>
                    <li>Clinical decision support integration</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Success Criteria:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>90%+ accuracy in personalization preferences</li>
                    <li>95%+ crisis detection sensitivity with less than 2% false positive rate</li>
                    <li>WCAG 2.1 AA accessibility compliance</li>
                    <li>FDA 510(k) submission preparation completed</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Phase 4: Optimization & Scale Preparation (Months 10-12)</h4>
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Deliverables:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Full clinical validation study results</li>
                    <li>Advanced analytics and outcome measurement</li>
                    <li>Multi-language expansion (5+ additional languages)</li>
                    <li>Enterprise deployment features and management tools</li>
                    <li>Post-market surveillance and continuous learning systems</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Success Criteria:</h5>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>FDA approval received for medical device classification</li>
                    <li>Clinical validation study shows significant outcome improvements</li>
                    <li>Platform ready for 10,000+ concurrent patient deployments</li>
                    <li>All security and compliance certifications completed</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Conversation Flows */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Conversation Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Pre-Surgery Anxiety Management</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm font-medium text-blue-700">Sophia</p>
                    <p className="text-sm text-muted-foreground">
                      "Hi Maria! I noticed your surgery is tomorrow morning. How are you feeling about everything?"
                    </p>
                  </div>
                  <div className="border-l-4 border-gray-400 pl-3">
                    <p className="text-sm font-medium text-gray-700">Maria (Patient)</p>
                    <p className="text-sm text-muted-foreground">
                      "Honestly, I'm really nervous. I've never had surgery before."
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm font-medium text-blue-700">Sophia</p>
                    <p className="text-sm text-muted-foreground">
                      "That's completely understandable, Maria. It's normal to feel anxious before your first surgery. Dr. Smith and the team have done hundreds of knee replacements - you're in excellent hands. Would it help if I walked you through what to expect tomorrow morning?"
                    </p>
                  </div>
                  <div className="border-l-4 border-gray-400 pl-3">
                    <p className="text-sm font-medium text-gray-700">Maria (Patient)</p>
                    <p className="text-sm text-muted-foreground">
                      "Yes, that would be really helpful."
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm font-medium text-blue-700">Sophia</p>
                    <p className="text-sm text-muted-foreground">
                      "Great! I'll send you a step-by-step guide, and we can go through any questions you have. Also, I've noticed some patients find the relaxation exercises helpful. Would you like me to share some breathing techniques you can use tonight and tomorrow morning?"
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Post-Surgery Complication Detection</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="border-l-4 border-gray-400 pl-3">
                    <p className="text-sm font-medium text-gray-700">Maria (Patient)</p>
                    <p className="text-sm text-muted-foreground">
                      "Sophia, I'm worried about my incision. It looks more red than yesterday."
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm font-medium text-blue-700">Sophia</p>
                    <p className="text-sm text-muted-foreground">
                      "I understand your concern, Maria. Let me ask a few questions to better help you. On a scale of 1-10, how would you rate any pain or tenderness around the incision compared to yesterday?"
                    </p>
                  </div>
                  <div className="border-l-4 border-gray-400 pl-3">
                    <p className="text-sm font-medium text-gray-700">Maria (Patient)</p>
                    <p className="text-sm text-muted-foreground">
                      "Maybe a 7? It was about a 4 yesterday."
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm font-medium text-blue-700">Sophia</p>
                    <p className="text-sm text-muted-foreground">
                      "Thank you for that information. Has there been any unusual drainage, warmth, or fever? Even a small increase in temperature?"
                    </p>
                  </div>
                  <div className="border-l-4 border-gray-400 pl-3">
                    <p className="text-sm font-medium text-gray-700">Maria (Patient)</p>
                    <p className="text-sm text-muted-foreground">
                      "Now that you mention it, I did feel a bit warm this morning."
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm font-medium text-blue-700">Sophia</p>
                    <p className="text-sm text-muted-foreground">
                      "Maria, based on what you're describing, I think it's important for Dr. Smith's team to take a look at your incision today. I'm going to contact them right now and arrange for someone to see you within the next few hours. This is likely something easily treatable, but we want to address it promptly."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}