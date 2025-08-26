/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { AppSidebar } from "@/components/app-sidebar";
import { NavUser } from "@/components/nav-user";
import { auth } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui";
import { Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Bell } from "lucide-react";

// Removed hardcoded userData - now using Better Auth session data

// Three-level breadcrumb mapping: route -> { section, group, page }
const routeToBreadcrumb: Record<
  string,
  { section: string; group: string; page: string }
> = {
  "/": { section: "Platform", group: "Console", page: "Overview" },
  "/analytics": { section: "Platform", group: "Console", page: "Analytics" },
  "/reports": { section: "Platform", group: "Console", page: "Reports" },
  "/care-plans": {
    section: "Platform",
    group: "Plan Library",
    page: "Care Plans",
  },
  "/organization": {
    section: "Platform",
    group: "Plan Library",
    page: "Organization",
  },
  "/team-plans": {
    section: "Platform",
    group: "Plan Library",
    page: "Team Plans",
  },
  "/my-plans": { section: "Platform", group: "Plan Library", page: "My Plans" },
  "/medical-records": {
    section: "Management",
    group: "Documentation",
    page: "Medical Records",
  },
  "/treatment-plans": {
    section: "Management",
    group: "Documentation",
    page: "Treatment Plans",
  },
  "/lab-results": {
    section: "Management",
    group: "Documentation",
    page: "Lab Results",
  },
  "/prescriptions": {
    section: "Management",
    group: "Documentation",
    page: "Prescriptions",
  },
  "/agents/patient-engagement": {
    section: "Platform",
    group: "Agents",
    page: "Patient Engagement Agent",
  },
  "/agents/genesis-agent": {
    section: "Platform",
    group: "Agents",
    page: "Genesis Agent",
  },
  "/agents/quantum-agent": {
    section: "Platform",
    group: "Agents",
    page: "Quantum Agent",
  },
  "/agents/compliance-agent": {
    section: "Platform",
    group: "Agents",
    page: "Compliance Agent",
  },
  "/agents/settings": {
    section: "Platform",
    group: "Agents",
    page: "Agent Settings",
  },
  "/care-exceptions": {
    section: "Platform",
    group: "Console",
    page: "Care Exceptions",
  },
  "/care-exceptions/$id": {
    section: "Platform",
    group: "Console",
    page: "Care Exception Details",
  },
  "/patient-pool": {
    section: "Platform",
    group: "Console",
    page: "Patient Pool",
  },
  "/account": { section: "Platform", group: "Settings", page: "Account" },
  "/preferences": {
    section: "Platform",
    group: "Settings",
    page: "Preferences",
  },
  "/security": { section: "Platform", group: "Settings", page: "Security" },
  "/about": { section: "Platform", group: "Settings", page: "About" },
  "/cardiology": {
    section: "Platform",
    group: "Projects",
    page: "Cardiology Unit",
  },
  "/patient-management": {
    section: "Platform",
    group: "Projects",
    page: "Patient Management",
  },
  "/quality-assurance": {
    section: "Platform",
    group: "Projects",
    page: "Quality Assurance",
  },
  "/prds/surgical-plan": {
    section: "Platform",
    group: "PRDs",
    page: "Surgical Plan PRD",
  },
  "/prds/sophia-patient-engagement": {
    section: "Platform",
    group: "PRDs",
    page: "Sophia Patient Engagement PRD",
  },
  "/prds/genesis-agent": {
    section: "Platform",
    group: "PRDs",
    page: "Genesis Agent PRD",
  },
  "/task-management": {
    section: "Platform",
    group: "Console",
    page: "Task Management",
  },
  "/genesis-settings": {
    section: "Platform",
    group: "Settings",
    page: "Genesis Settings",
  },
  "/genesis-findings/2024-08": {
    section: "Source",
    group: "Genesis Findings",
    page: "August 2024",
  },
  "/genesis-findings/2024-07": {
    section: "Source",
    group: "Genesis Findings",
    page: "July 2024",
  },
  "/genesis-findings/2024-06": {
    section: "Source",
    group: "Genesis Findings",
    page: "June 2024",
  },
  "/genesis-findings/2024-05": {
    section: "Source",
    group: "Genesis Findings",
    page: "May 2024",
  },
  "/genesis-findings/2024-04": {
    section: "Source",
    group: "Genesis Findings",
    page: "April 2024",
  },
  "/genesis-findings/2024-03": {
    section: "Source",
    group: "Genesis Findings",
    page: "March 2024",
  },
};

export function Layout() {
  const location = useLocation();
  const { data: session } = auth.useSession();

  // Handle dynamic routes like /task-management/$taskId
  let breadcrumbData = routeToBreadcrumb[location.pathname];
  if (!breadcrumbData) {
    if (location.pathname.startsWith("/task-management/")) {
      breadcrumbData = {
        section: "Platform",
        group: "Console",
        page: "Task Details",
      };
    } else {
      breadcrumbData = { section: "Platform", group: "Unknown", page: "Page" };
    }
  }

  // Only create user data if there's a valid session
  const userData = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "/avatars/default.jpg",
      }
    : null;

  return (
    <StoreProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    {breadcrumbData.section}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>{breadcrumbData.group}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbData.page}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 relative"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="font-medium">
                      BP Noncompliance - Requires Human Review
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Patient P-12847: AI escalated - Multiple days of elevated
                      BP readings without response
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Compliance agent requires human intervention • 5 minutes
                      ago
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="font-medium">
                      Postop Red Flag - Requires Human Review
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Patient P-18456: AI escalated - Critical post-surgical
                      vitals require immediate attention
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Care manager agent requires human intervention • 12
                      minutes ago
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="font-medium">
                      Abnormal Lab Result - Requires Human Review
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Patient P-19234: AI escalated - Critical lab values
                      detected, urgent review needed
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Quantum agent requires human intervention • 45 minutes ago
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center justify-center">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {userData && <NavUser user={userData} />}
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <TanStackRouterDevtools />
    </StoreProvider>
  );
}
