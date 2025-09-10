import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Organization } from "@/lib/types/organization";

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

type TeamSwitcherProps = {
  organizations: Organization[];
  activeOrgId?: string;
  onSelectOrg?: (organization: Organization) => void;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

export default function TeamSwitcher({
  organizations,
  activeOrgId,
  onSelectOrg,
}: TeamSwitcherProps) {
  const id = useId();

  const OrgAvatar = ({ org }: { org: Organization }) => {
    const [useIcon, setUseIcon] = useState(true);
    let faviconUrl: string | undefined;
    try {
      const domain = new URL(org.url || "").hostname;
      if (domain) faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
      faviconUrl = undefined;
    }
    const initials = getInitials(org.name);
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

  return (
    <div className="w-full *:not-first:mt-2 mb-1">
      <Select
        value={activeOrgId}
        onValueChange={(value) => {
          const selected = organizations.find((o) => o.id === value);
          if (selected && onSelectOrg) onSelectOrg(selected);
        }}
      >
        <SelectTrigger
          id={id}
          size="lg"
          className="w-full text-[15px] [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_[data-square]]:shrink-0  border-1 bg-white/50 border-stone-200"
        >
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent className="text-[15px] [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2">
          <SelectGroup>
            <SelectLabel className="ps-2 text-xs">
              only one org supported at the moment
            </SelectLabel>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <OrgAvatar org={org} />
                <span className="truncate">{org.name}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
