/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { AppSidebar } from "@/components/app-sidebar";
import { NavUser } from "@/components/nav-user";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui";
import { useLocation } from "@tanstack/react-router";
import { StoreProvider } from "@/lib/store";
import { auth } from "@/lib/auth";

// Removed hardcoded userData - now using Better Auth session data

// Three-level breadcrumb mapping: route -> { section, group, page }
const routeToBreadcrumb: Record<string, { section: string; group: string; page: string }> = {
  "/": { section: "Platform", group: "Console", page: "Overview" },
  "/analytics": { section: "Platform", group: "Console", page: "Analytics" },
  "/reports": { section: "Platform", group: "Console", page: "Reports" },
  "/care-plans": { section: "Platform", group: "Plan Library", page: "Care Plans" },
  "/clinical-support": { section: "Platform", group: "Plan Library", page: "Clinical Support" },
  "/patients": { section: "Platform", group: "Plan Library", page: "Patient Records" },
  "/appointments": { section: "Platform", group: "Plan Library", page: "Appointments" },
  "/medical-records": { section: "Management", group: "Documentation", page: "Medical Records" },
  "/treatment-plans": { section: "Management", group: "Documentation", page: "Treatment Plans" },
  "/lab-results": { section: "Management", group: "Documentation", page: "Lab Results" },
  "/prescriptions": { section: "Management", group: "Documentation", page: "Prescriptions" },
  "/agents/patient-engagement": { section: "Platform", group: "Agents", page: "Patient Engagement Agent" },
  "/agents/genesis-agent": { section: "Platform", group: "Agents", page: "Genesis Agent" },
  "/agents/quantum-agent": { section: "Platform", group: "Agents", page: "Quantum Agent" },
  "/agents/compliance-agent": { section: "Platform", group: "Agents", page: "Compliance Agent" },
  "/agents/settings": { section: "Platform", group: "Agents", page: "Agent Settings" },
  "/care-exceptions": { section: "Platform", group: "Console", page: "Care Exceptions" },
  "/patient-pool": { section: "Platform", group: "Console", page: "Patient Pool" },
  "/account": { section: "Platform", group: "Settings", page: "Account" },
  "/preferences": { section: "Platform", group: "Settings", page: "Preferences" },
  "/security": { section: "Platform", group: "Settings", page: "Security" },
  "/about": { section: "Platform", group: "Settings", page: "About" },
  "/cardiology": { section: "Platform", group: "Projects", page: "Cardiology Unit" },
  "/patient-management": { section: "Platform", group: "Projects", page: "Patient Management" },
  "/quality-assurance": { section: "Platform", group: "Projects", page: "Quality Assurance" },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data: session } = auth.useSession();
  const breadcrumbData = routeToBreadcrumb[location.pathname] || { section: "Platform", group: "Unknown", page: "Page" };

  // Only create user data if there's a valid session
  const userData = session?.user ? {
    name: session.user.name || 'User',
    email: session.user.email || '',
    avatar: session.user.image || '/avatars/default.jpg'
  } : null;

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
                  <BreadcrumbLink href="/">{breadcrumbData.section}</BreadcrumbLink>
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
            {userData && (
              <div className="ml-auto">
                <NavUser user={userData} />
              </div>
            )}
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </StoreProvider>
  );
}
