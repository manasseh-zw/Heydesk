import * as React from "react";
import {
  BarChartIcon,
  ClipboardListIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { useStore } from "@tanstack/react-store";
import { Link } from "@tanstack/react-router";
import { authActions, authState } from "@/lib/state/auth.state";
import { Logo } from "@/components/logo";
import { CopyButton } from "@/components/copy-button";
import TeamSwitcher from "@/components/team-switcher";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Home", url: "/", icon: LayoutDashboardIcon },
    { title: "Tickets", url: "/tickets", icon: ClipboardListIcon },
    { title: "Agents", url: "/agents", icon: UsersIcon },
    { title: "Knowledge Base", url: "/knowledgebase", icon: FileTextIcon },
    { title: "Analytics", url: "/analytics", icon: BarChartIcon },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, organization } = useStore(authState);
  const basePath = organization?.slug ? `/${organization.slug}` : "/";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const supportLink = organization?.slug
    ? `${origin}/support/${organization.slug}`
    : `${origin}/support`;
  const navItems = [
    { title: "Home", url: basePath, icon: LayoutDashboardIcon },
    { title: "Tickets", url: `${basePath}/tickets`, icon: ClipboardListIcon },
    { title: "Agents", url: `${basePath}/agents`, icon: UsersIcon },
    {
      title: "Knowledge Base",
      url: `${basePath}/knowledgebase`,
      icon: FileTextIcon,
    },
    { title: "Analytics", url: `${basePath}/analytics`, icon: BarChartIcon },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-1">
        {/* Brand + Share Support Link */}
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-2 py-2">
              <Link
                to={basePath}
                className="flex items-center gap-2"
                aria-label="Home"
              >
                <Logo className="h-6 w-auto shrink-0" />
                <span className="text-lg font-light leading-none">
                  Hey<span className="text-lime-500 font-light">desk</span>
                </span>
              </Link>
              <CopyButton text={supportLink} tooltip="Copy support link" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        <TeamSwitcher
          organizations={organization ? [organization] : []}
          activeOrgId={organization?.id}
          onSelectOrg={(org) => authActions.setOrganization(org)}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={
            user
              ? {
                  name: user.username || "User",
                  email: user.email,
                  avatar: user.avatarUrl || "/avatars/default.jpg",
                }
              : data.user
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
