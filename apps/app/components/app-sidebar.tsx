import * as React from "react"
import {
  Activity,
  BookOpen,
  Bot,
  Building2,
  FileText,
  Heart,
  Home,
  Settings2,
  Stethoscope,
  Users,
  UserCheck,
} from "lucide-react"

import { NavMain, NavManagement, NavDocumentation } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui"

// Healthcare application data
const data = {
  user: {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@sophia.health",
    avatar: "/avatars/doctor.jpg",
  },
  teams: [
    {
      name: "Sophia Health",
      logo: Heart,
      plan: "Professional",
    },
    {
      name: "Medical Center",
      logo: Building2,
      plan: "Enterprise",
    },
    {
      name: "Research Lab",
      logo: Activity,
      plan: "Research",
    },
  ],
  navMain: [
    {
      title: "Console",
      url: "/",
      icon: Home,
      items: [
        {
          title: "Overview",
          url: "/",
        },
        {
          title: "Care Exceptions",
        url: "/care-exceptions",
        },
        {
          title: "Patient Pool",
          url: "/patient-pool",
        },
        {
          title: "Reports",
          url: "/reports",
        },
      ],
    },
    {
      title: "Plan Library",
      url: "#",
      icon: Stethoscope,
      items: [
        {
          title: "Care Plans",
          url: "/care-plans",
        },
        {
          title: "Clinical Support",
          url: "/clinical-support",
        },
        {
          title: "Patient Records",
          url: "/patients",
        },
        {
          title: "Appointments",
          url: "/appointments",
        },
      ],
    },
  ],
  navManagement: [
    {
      title: "Documentation",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Medical Records",
          url: "/medical-records",
        },
        {
          title: "Treatment Plans",
          url: "/treatment-plans",
        },
        {
          title: "Lab Results",
          url: "/lab-results",
        },
        {
          title: "Prescriptions",
          url: "/prescriptions",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Account",
          url: "/account",
        },
        {
          title: "Preferences",
          url: "/preferences",
        },
        {
          title: "Security",
          url: "/security",
        },
        {
          title: "About",
          url: "/about",
        },
      ],
    },
  ],
  navDocumentation: [
    {
      title: "Agents",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Patient Engagement Agent",
          url: "/agents/patient-engagement",
        },
        {
          title: "Compliance Agent",
          url: "/agents/compliance-agent",
        },
        {
          title: "Genesis Agent",
          url: "/agents/genesis-agent",
        },
        {
          title: "Quantum Agent",
          url: "/agents/quantum-agent",
        },
        {
          title: "Agent Settings",
          url: "/agents/settings",
        },
      ],
    },
    {
      title: "PRDs",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Surgical Plan PRD",
          url: "/prds/surgical-plan",
        },
        {
          title: "Sophia Patient Engagement PRD",
          url: "/prds/sophia-patient-engagement",
        },
        {
          title: "Genesis Agent PRD",
          url: "/prds/genesis-agent",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Cardiology Unit",
      url: "/cardiology",
      icon: Heart,
    },
    {
      name: "Patient Management",
      url: "/patient-management",
      icon: Users,
    },
    {
      name: "Quality Assurance",
      url: "/quality-assurance",
      icon: UserCheck,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavManagement items={data.navManagement} />
        <NavDocumentation items={data.navDocumentation} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
