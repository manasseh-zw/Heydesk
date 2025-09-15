import * as React from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@tanstack/react-store";
import {
  customerAuthState,
  customerAuthActions,
} from "@/lib/state/customer.state";

const Square = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    data-square
    className={cn(
      "bg-muted text-muted-foreground flex size-6 items-center justify-center rounded text-[13px] font-medium",
      className
    )}
    aria-hidden="true"
  >
    {children}
  </span>
);

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

interface OrgSwitcherProps {
  isCollapsed: boolean;
  organizations: {
    label: string;
    slug: string;
    url?: string;
  }[];
}

export function OrgSwitcher({ isCollapsed, organizations }: OrgSwitcherProps) {
  const navigate = useNavigate();
  const params = useParams({ from: "/support/$org" });
  const { currentOrganization } = useStore(customerAuthState);

  // Use current organization from store, fallback to URL param, then first org
  const selectedOrg =
    currentOrganization || params?.org || organizations[0]?.slug || "";

  // Sync store with URL param on mount/param change
  React.useEffect(() => {
    const urlOrg = params?.org;
    if (urlOrg && urlOrg !== currentOrganization) {
      customerAuthActions.setCurrentOrganization(urlOrg);
    }
  }, [params?.org]);

  // If organizations list loads later and selected is empty or invalid, pick first
  React.useEffect(() => {
    if (!selectedOrg && organizations.length > 0) {
      customerAuthActions.setCurrentOrganization(organizations[0].slug);
    } else if (
      selectedOrg &&
      organizations.length > 0 &&
      !organizations.some((o) => o.slug === selectedOrg)
    ) {
      customerAuthActions.setCurrentOrganization(organizations[0].slug);
    }
  }, [organizations.length]);

  const OrgAvatar = ({ org }: { org: { label: string; url?: string } }) => {
    const [useIcon, setUseIcon] = React.useState(true);
    let faviconUrl: string | undefined;
    try {
      const domain = new URL(org.url || "").hostname;
      if (domain) faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
      faviconUrl = undefined;
    }
    const initials = getInitials(org.label);
    return (
      <Square className="bg-white">
        {useIcon && faviconUrl ? (
          <img
            src={faviconUrl}
            alt={initials}
            width={16}
            height={16}
            className="size-4"
            onError={() => setUseIcon(false)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </Square>
    );
  };

  const handleOrgChange = (orgSlug: string) => {
    // Update the store
    customerAuthActions.setCurrentOrganization(orgSlug);

    // Navigate to the new organization's support page
    navigate({ to: "/support/$org", params: { org: orgSlug } });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedOrg} onValueChange={handleOrgChange}>
        <SelectTrigger
          className={cn(
            "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
              "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
          )}
          aria-label="Select organization"
        >
          <SelectValue placeholder="Select organization">
            {organizations.find((org) => org.slug === selectedOrg) && (
              <OrgAvatar
                org={organizations.find((org) => org.slug === selectedOrg)!}
              />
            )}
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {organizations.find((org) => org.slug === selectedOrg)?.label}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.slug} value={org.slug}>
              <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                <OrgAvatar org={org} />
                {org.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!isCollapsed && (
        <Link to="/onboarding/select-organization">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add organization</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
