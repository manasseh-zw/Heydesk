import { Logo } from "../logo";
import { NavUser } from "../org/layout/nav-user";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  Sidebar,
} from "../ui/sidebar";
import { AccountSwitcher } from "./account-switcher";
import { accounts, chats, tickets } from "./data";
import { useStore } from "@tanstack/react-store";
import { customerAuthState } from "@/lib/state/customer.state";
import { Search } from "lucide-react";
import { TicketList } from "./ticket-list";
import { ChatList } from "./chat-list";

export default function SupportSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { customer } = useStore(customerAuthState);
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
              <AccountSwitcher isCollapsed={false} accounts={accounts} />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator className="bg-zinc-100" />
      <SidebarContent>
        <Tabs defaultValue="tickets">
          <div className="flex items-center px-2 pt-3">
            <TabsList className="w-full h-10">
              <TabsTrigger value="tickets" className="w-1/2">
                Tickets
              </TabsTrigger>
              <TabsTrigger value="chats" className="w-1/2">
                Chats
              </TabsTrigger>
            </TabsList>
          </div>
          {/* <Separator /> */}
          <TabsContent value="tickets" className="m-0 h-screen">
            <TicketList items={tickets} />
          </TabsContent>
          <TabsContent value="chats" className="m-0 h-screen">
            <ChatList items={chats} />
          </TabsContent>
        </Tabs>
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
