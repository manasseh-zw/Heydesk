import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "@tanstack/react-router";

export function SiteHeader() {
  const location = useLocation();

  const parts = location.pathname.split("/").filter(Boolean);
  // parts[0] = org slug (when under /$org)
  const section = parts.length > 1 ? parts[1] : "";

  const titleMap: Record<string, string> = {
    tickets: "Tickets",
    agents: "Agents",
    knowledgebase: "Knowledge Base",
    analytics: "Analytics",
  };

  const format = (s: string) =>
    s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const title = section ? (titleMap[section] ?? format(section)) : "Home";

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}
