"use client";

import { type LucideIcon } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const location = useLocation();
  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;
  const currentPath = normalize(location.pathname);
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="h-10 px-3 gap-2 text-[14px]"
                isActive={
                  item.title === "Home"
                    ? normalize(item.url) === currentPath
                    : currentPath === normalize(item.url) ||
                      currentPath.startsWith(normalize(item.url) + "/")
                }
              >
                <Link to={item.url}>
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="leading-normal">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
