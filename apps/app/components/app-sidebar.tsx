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
  UserCheck,
  Users,
} from "lucide-react";
import * as React from "react";

import {
  NavDocumentation,
  NavMain,
  NavManagement,
  NavSource,
} from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui";

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
      title: "Care Plans",
      url: "/care-plans?level=sophia",
      icon: Stethoscope,
      items: [
        {
          title: "Sophia Plans",
          url: "/care-plans?level=sophia",
        },
        {
          title: "Organization Plans",
          url: "/care-plans?level=organization",
        },
        {
          title: "Team Plans",
          url: "/care-plans?level=team",
        },
        {
          title: "My Plans",
          url: "/care-plans?level=my",
        },
        {
          title: "Task Management",
          url: "/task-management",
        },
      ],
    },
  ],
  navManagement: [
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
        {
          title: "Genesis Settings",
          url: "/genesis-settings",
        },
      ],
    },
  ],
  navSource: [
    {
      title: "Genesis Findings",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Aug 2024",
          url: "/genesis-findings/2024-08",
        },
        {
          title: "Jul 2024", 
          url: "/genesis-findings/2024-07",
        },
        {
          title: "Jun 2024",
          url: "/genesis-findings/2024-06",
        },
        {
          title: "May 2024",
          url: "/genesis-findings/2024-05",
        },
        {
          title: "Apr 2024",
          url: "/genesis-findings/2024-04",
        },
        {
          title: "Mar 2024",
          url: "/genesis-findings/2024-03",
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavManagement items={data.navManagement} />
        <NavSource items={data.navSource} />
        <NavDocumentation items={data.navDocumentation} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
