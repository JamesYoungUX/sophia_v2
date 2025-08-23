"use client";

import { Link, useLocation, type ParsedLocation } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useEffect } from "react";

import { consoleOpenAtom, openNavigationSectionAtom } from "@/lib/store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@repo/ui";

// Hook for managing navigation state with Jotai (excluding Console)
export function useNavigationState() {
  const [openSection, setOpenSection] = useAtom(openNavigationSectionAtom);
  const location = useLocation();

  // Auto-open section based on current route (Console is handled separately)
  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.startsWith("/agents")) {
      setOpenSection("Agents");
    } else if (pathname.startsWith("/care-plans")) {
      setOpenSection("Care Plans");
    } else if (pathname.startsWith("/settings")) {
      setOpenSection("Settings");
    } else if (pathname.startsWith("/documentation")) {
      setOpenSection("Documentation");
    }
  }, [location.pathname, setOpenSection]);

  return { openSection, setOpenSection };
}

// Hook for managing Console state independently
export function useConsoleState() {
  const [isConsoleOpen, setIsConsoleOpen] = useAtom(consoleOpenAtom);

  return { isConsoleOpen, setIsConsoleOpen };
}

// Helper function to check if a sub-item is active
function isSubItemActive(subItemUrl: string, location: ParsedLocation) {
  if (subItemUrl.includes("care-plans?level=")) {
    const levelParam = subItemUrl.split("level=")[1];
    const urlParams = new URLSearchParams(location.search);
    const currentLevel = urlParams.get("level");
    return location.pathname === "/care-plans" && currentLevel === levelParam;
  }
  return location.pathname === subItemUrl;
}

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();
  const { openSection, setOpenSection } = useNavigationState();
  const { isConsoleOpen, setIsConsoleOpen } = useConsoleState();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isConsoleSection = item.title === "Console";
          const isOpen = isConsoleSection
            ? isConsoleOpen
            : openSection === item.title;

          const handleOpenChange = (open: boolean) => {
            if (isConsoleSection) {
              // Console can be toggled independently, only responds to direct clicks
              setIsConsoleOpen(open);
            } else {
              // Other sections follow accordion behavior
              setOpenSection(open ? item.title : null);
            }
          };

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={handleOpenChange}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isActive = isSubItemActive(subItem.url, location);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isActive}>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function NavManagement({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();
  const { openSection, setOpenSection } = useNavigationState();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Management</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isOpen = openSection === item.title;

          const handleOpenChange = (open: boolean) => {
            setOpenSection(open ? item.title : null);
          };

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={handleOpenChange}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isActive = isSubItemActive(subItem.url, location);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isActive}>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function NavDocumentation({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();
  const { openSection, setOpenSection } = useNavigationState();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Documentation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isOpen = openSection === item.title;

          const handleOpenChange = (open: boolean) => {
            setOpenSection(open ? item.title : null);
          };

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={handleOpenChange}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isActive = isSubItemActive(subItem.url, location);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isActive}>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
