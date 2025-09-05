import { useId } from "react";

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
      "bg-muted text-muted-foreground flex size-5 items-center justify-center rounded text-xs font-medium",
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

  return (
    <div className="w-full *:not-first:mt-2">
      <Select
        value={activeOrgId}
        onValueChange={(value) => {
          const selected = organizations.find((o) => o.id === value);
          if (selected && onSelectOrg) onSelectOrg(selected);
        }}
      >
        <SelectTrigger
          id={id}
          className="w-full [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_[data-square]]:shrink-0"
        >
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2">
          <SelectGroup>
            <SelectLabel className="ps-2">Switch organization</SelectLabel>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <Square className="bg-indigo-400/20 text-indigo-500">
                  {getInitials(org.name)}
                </Square>
                <span className="truncate">{org.name}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
