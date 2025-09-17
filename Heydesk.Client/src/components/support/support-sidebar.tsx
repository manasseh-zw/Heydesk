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
import { useStore } from "@tanstack/react-store";
import { customerAuthState } from "@/lib/state/customer.state";
import { Search, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ChatList } from "./chat-list";
import { useNavigate } from "@tanstack/react-router";
import { useConversations } from "@/lib/hooks/use-conversations";
import { useConversationsRevalidation } from "@/lib/hooks/use-conversations-revalidation";
import { useParams } from "@tanstack/react-router";

export default function SupportSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const params = useParams({ from: "/support/$org" });
  const [customer, currentOrganizationSlug] = useStore(
    customerAuthState,
    (state) => [state.customer, state.currentOrganization]
  );

  // Get the active organization from URL params or current organization
  const activeOrgSlug = params?.org || currentOrganizationSlug;

  // Find the active organization by slug to get its ID
  const activeOrganization = customer?.organizations?.find(
    (org) => org.slug === activeOrgSlug
  );

  // Convert customer organizations to org switcher format
  const organizations =
    customer?.organizations?.map((org) => ({
      label: org.name,
      slug: org.slug,
      url: org.url,
    })) || [];

  // Fetch conversations for the active organization using its ID
  const { data: conversationsData, isLoading } = useConversations(
    activeOrganization?.id || undefined,
    {
      page: 1,
      pageSize: 20,
    }
  );

  // Set up real-time revalidation for conversations
  useConversationsRevalidation(activeOrganization?.id);

  // Use conversations directly from the API
  const conversations = conversationsData?.conversations || [];

  const handleNewChat = () => {
    if (activeOrgSlug) {
      navigate({
        to: "/support/$org" as any,
        params: { org: activeOrgSlug } as any,
      });
    }
  };

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
            <Button
              size="icon"
              variant="default"
              className="h-8 w-8"
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">New chat</span>
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-muted-foreground">
              Loading conversations...
            </div>
          </div>
        ) : (
          <ChatList items={conversations} />
        )}
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
