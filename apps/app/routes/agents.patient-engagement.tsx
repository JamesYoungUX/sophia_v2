import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";

const engagementTodos = [
  "Design conversational outreach and engagement flows",
  "Integrate with SMS, app, email, and phone channels",
  "Implement patient education and nudge logic",
  "Support accessibility and language preferences",
  "Enable feedback collection and learning loops",
  "Coordinate with other agents for escalation and support",
];

const buildInstructions = [
  "Scaffold Patient Engagement Agent backend: manage communication channels, message templates, and patient preferences.",
  "Integrate with SMS, app, email, and phone APIs.",
  "Build frontend UI for patient conversations, education, and feedback.",
  "Implement learning and personalization logic.",
  "Test with diverse patient scenarios and iterate with clinicians and patients.",
];

export const Route = createFileRoute("/agents/patient-engagement")({
  beforeLoad: requireAuth,
  component: () => (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <h1 className="text-3xl font-bold mb-4">Patient Engagement Agent</h1>
      <div className="mb-4 text-base text-primary">
        <strong>Sophia’s Origin and Persona</strong>
        <br />
        The Patient Engagement Agent is more than just a digital assistant—it’s
        where Sophia’s name, personality, and compassionate presence come to
        life. Through every message, reminder, and conversation, Sophia builds
        trust, offers guidance, and ensures every patient feels seen, heard, and
        supported. This agent is the heart of Sophia’s mission: to make
        healthcare personal, proactive, and empowering for all.
      </div>
      <div className="mb-4 text-base text-muted-foreground">
        <strong>What is the Patient Engagement Agent, technically?</strong>
        <br />
        The Patient Engagement Agent is Sophia’s digital companion for every
        patient. It orchestrates friendly, accessible, and proactive
        communication across SMS, app, email, and phone. This agent collects
        patient-reported outcomes, delivers education and reminders, provides
        helpful guidance, and ensures every patient feels heard and supported.
        It adapts to language, accessibility, and cultural needs, and
        coordinates with other agents to escalate urgent issues or deliver
        personalized interventions. The agent continuously learns from patient
        feedback and outcomes to improve engagement and care.
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          Patient Engagement Agent Responsibilities
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Conversational outreach: SMS, app, email, phone</li>
          <li>Patient education and reminders</li>
          <li>Collecting patient-reported outcomes and barriers</li>
          <li>Personalized nudges and motivational support</li>
          <li>Accessibility: language, disability, cultural adaptation</li>
          <li>Escalation of urgent responses to care team</li>
          <li>Feedback collection and continuous learning</li>
        </ul>
        <h2 className="text-xl font-semibold mb-2">
          Patient Engagement Agent Opportunities
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            <strong>Learning:</strong> Adapts communication style and content
            based on patient preferences and outcomes.
          </li>
          <li>
            <strong>Outreach:</strong> Proactively checks in with patients,
            reminds them of appointments, medications, and care plan steps.
          </li>
          <li>
            <strong>Friendly, Helpful Guidance:</strong> Explains clinical
            concepts in plain language, offers encouragement, and helps patients
            navigate their care journey.
          </li>
          <li>
            <strong>Accessibility:</strong> Supports multiple languages, reading
            levels, and communication formats (text, audio, visual).
          </li>
          <li>
            <strong>Collaboration:</strong> Works with other agents to escalate
            issues, suggest interventions, and close the loop with the care
            team.
          </li>
        </ul>
        <h2 className="text-xl font-semibold mb-2">
          Patient Engagement Agent TODOs
        </h2>
        <ul className="list-disc list-inside mb-4">
          {engagementTodos.map((todo) => (
            <li key={todo}>{todo}</li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mb-2">
          Build the Patient Engagement Agent
        </h2>
        <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-1">
          {buildInstructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <h2 className="text-xl font-semibold mb-2">
          Example Scenario: Transportation Support
        </h2>
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Scenario:</strong> Maria, a 68-year-old patient, has a knee replacement surgery scheduled for tomorrow morning but hasn't arranged transportation to the hospital.
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-3">
              <p className="text-sm font-medium text-blue-700">Patient Engagement Agent (Sophia)</p>
              <p className="text-sm text-muted-foreground">
                 "Hi Maria! Your surgery is tomorrow at 8 AM. I wanted to check - do you have transportation arranged to get to the hospital?"
               </p>
            </div>
            <div className="border-l-4 border-gray-400 pl-3">
              <p className="text-sm font-medium text-gray-700">Maria (Patient)</p>
              <p className="text-sm text-muted-foreground">
                "Oh no, I completely forgot! My daughter was supposed to drive me but she's sick. I don't know what to do."
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-3">
              <p className="text-sm font-medium text-blue-700">Patient Engagement Agent (Sophia)</p>
              <p className="text-sm text-muted-foreground">
                 "Don't worry, Maria! Let me help you find some options. I'm connecting with our care coordination team to explore transportation solutions."
               </p>
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <p className="text-sm font-medium text-green-700">Care Coordination Agent</p>
              <p className="text-sm text-muted-foreground">
                "I've identified 3 transportation options for Maria: 1) Medical transport service (covered by insurance), 2) Rideshare voucher program, 3) Hospital shuttle from nearby community center."
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-3">
              <p className="text-sm font-medium text-purple-700">Scheduling Agent</p>
              <p className="text-sm text-muted-foreground">
                "I've reserved a medical transport pickup at 7:15 AM from Maria's address. Confirmation sent to her phone. Also adjusted pre-op timeline to account for transport arrival."
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-3">
              <p className="text-sm font-medium text-orange-700">Compliance Agent</p>
              <p className="text-sm text-muted-foreground">
                "Transport arrangement verified. All pre-operative documentation is complete. Patient consent forms are on file and transportation meets accessibility requirements."
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-3">
              <p className="text-sm font-medium text-blue-700">Patient Engagement Agent (Sophia)</p>
              <p className="text-sm text-muted-foreground">
                 "Great news, Maria! I've arranged medical transport for you tomorrow at 7:15 AM. The driver will call when they arrive. You'll get to the hospital with plenty of time. Is there anything else you need help with?"
               </p>
            </div>
            <div className="border-l-4 border-gray-400 pl-3">
              <p className="text-sm font-medium text-gray-700">Maria (Patient)</p>
              <p className="text-sm text-muted-foreground">
                "Thank you so much! I was so worried. You've been such a help. I feel much better now."
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs font-medium text-blue-800 mb-1">Agent Collaboration Summary:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Patient Engagement Agent:</strong> Detected issue, provided emotional support, coordinated solution</li>
              <li>• <strong>Care Coordination Agent:</strong> Researched transportation options and insurance coverage</li>
              <li>• <strong>Scheduling Agent:</strong> Made reservations and adjusted timeline</li>
              <li>• <strong>Compliance Agent:</strong> Verified documentation completeness and accessibility compliance</li>
              <li>• <strong>Result:</strong> Patient stress reduced, surgery proceeds as planned, care continuity maintained</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
});