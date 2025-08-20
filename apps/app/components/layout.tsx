/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import {
  Bone,
  BookOpen,
  Bot,
  ClipboardList,
  Heart, // Add User icon
  HeartHandshake,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User, // Add User icon
} from "lucide-react";
import * as React from "react";

import { FaviconIcon } from "@/components/favicon-icon";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Sophia",
      logo: FaviconIcon,
      plan: "Enterprise",
    },
    {
      name: "Cardiology",
      logo: Heart,
      plan: "Department",
    },
    {
      name: "Orthopedics",
      logo: Bone,
      plan: "Department",
    },
  ],
  navMain: [
    {
      title: "Console",
      url: "/console",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Clinical Support",
          url: "/clinical-support",
        },
        {
          title: "Patients",
          url: "/patients",
        },
        {
          title: "History",
          url: "/history",
        },
      ],
    },
  ],
  management: [
    {
      name: "Care Plans",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          name: "Care Plans Overview",
          url: "/care-plans",
          icon: ClipboardList,
        },
        {
          name: "Care Plan A",
          url: "#",
          icon: ClipboardList,
        },
        {
          name: "Care Plan B",
          url: "#",
          icon: ClipboardList,
        },
      ],
    },
    {
      name: "Access",
      url: "#",
      icon: PieChart,
      items: [
        {
          name: "Access Log",
          url: "#",
          icon: PieChart,
        },
        {
          name: "Permissions",
          url: "#",
          icon: PieChart,
        },
      ],
    },
    {
      name: "Agents",
      url: "#",
      icon: Map,
      items: [
        {
          name: "Genesis Agent",
          url: "/agents/genesis-agent",
          icon: Bot,
        },
        {
          name: "Compliance Agent",
          url: "/compliance-agent",
          icon: Bot,
        },
        {
          name: "Quantum Agent",
          url: "/agents/quantum-agent",
          icon: Bot,
        },
        {
          name: "Care Manager Agent",
          url: "/agents/care-manager-agent",
          icon: User, // Use User icon
        },
        {
          name: "Patient Engagement Agent",
          url: "/agents/patient-engagement-agent",
          icon: HeartHandshake, // Use HeartHandshake icon
        },
      ],
    },
    {
      name: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          name: "API Reference",
          url: "#",
          icon: BookOpen,
        },
        {
          name: "User Guide",
          url: "#",
          icon: BookOpen,
        },
        {
          name: "Care Plan Lifecycle & Agent Roles",
          url: "/docs/care-plan-lifecycle",
          icon: BookOpen,
        },
      ],
    },
    {
      name: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          name: "General",
          url: "#",
          icon: Settings2,
        },
        {
          name: "Team",
          url: "#",
          icon: Settings2,
        },
        {
          name: "Billing",
          url: "#",
          icon: Settings2,
        },
        {
          name: "Limits",
          url: "#",
          icon: Settings2,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      data-testid="sidebar"
      collapsible="icon"
      className="flex flex-col h-full min-h-0"
      {...props}
    >
      <SidebarHeader data-testid="sidebar-header">
        <TeamSwitcher data-testid="team-switcher-root" teams={data.teams} />
      </SidebarHeader>
      <SidebarContent
        data-testid="sidebar-content"
        className="flex-1 flex flex-col h-full min-h-0"
      >
        <NavMain data-testid="nav-main" items={data.navMain} />
        <NavProjects data-testid="nav-projects" projects={data.management} />
      </SidebarContent>
      <SidebarFooter
        data-testid="sidebar-footer"
        className="h-16 flex items-center justify-center"
      >
        <a
          href="/about"
          className="sidebar-link text-center w-4/5 rounded bg-accent border border-primary py-2"
        >
          <span>About</span>
        </a>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}
