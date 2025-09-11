import { Logo } from "../logo";
import { NavUser } from "../org/layout/nav-user";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  Sidebar,
} from "../ui/sidebar";
import { OrgSwitcher } from "./org-switcher";
import { chats } from "./data";
import { useStore } from "@tanstack/react-store";
import { customerAuthState } from "@/lib/state/customer.state";
import { Search, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ChatList } from "./chat-list";

export default function SupportSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { customer } = useStore(customerAuthState);

  // Convert customer organizations to org switcher format
  const organizations =
    customer?.organizations?.map((org) => ({
      label: org.name,
      slug: org.slug,
      url: org.url,
    })) || [];

  return (
    <Sidebar
      collapsible="offcanvas"
      className="[&_[data-slot=sidebar-inner]]:bg-[#FDFDFD]"
      {...props}
    >
      <SidebarHeader className="px-1 py-1">
        {/* Brand + Account Switcher */}
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-2 py-2">
              <div className="flex items-center gap-2">
                <Logo className="h-6 w-auto shrink-0" />
                <span className="text-lg font-light leading-none">
                  Hey<span className="text-lime-500 font-light">desk</span>
                </span>
              </div>
              <OrgSwitcher isCollapsed={false} organizations={organizations} />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator className="bg-zinc-100" />
      <SidebarContent>
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input placeholder="Search conversations" className="pl-8" />
            </div>
            <Button size="icon" variant="default" className="h-8 w-8">
              <Plus className="h-4 w-4" />
              <span className="sr-only">New chat</span>
            </Button>
          </div>
        </div>
        <ChatList items={chats} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: customer!.username,
            avatar: customer!.avatarUrl as string,
            email: customer!.email,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
