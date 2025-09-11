import { useId, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { Organization } from "@/lib/types/organization";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

export default function Component({
  organizations,
  value,
  onChange,
  placeholder = "Select organization",
}: {
  organizations: Organization[];
  value?: string;
  onChange?: (orgId: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>Select with search and button</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value ? (
                <span className="inline-flex items-center gap-2">
                  <OrgAvatar org={organizations.find((o) => o.id === value)!} />
                  {organizations.find((o) => o.id === value)?.name}
                </span>
              ) : (
                placeholder
              )}
            </span>
            <ChevronDownIcon
              size={16}
              className="text-muted-foreground/80 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Find organization" />
            <CommandList>
              <CommandEmpty>No organization found.</CommandEmpty>
              <CommandGroup>
                {organizations.map((organization) => (
                  <CommandItem
                    key={organization.id}
                    value={organization.id}
                    onSelect={(currentValue) => {
                      onChange?.(currentValue);
                      setOpen(false);
                    }}
                  >
                    <OrgAvatar org={organization} />
                    {organization.name}
                    {value === organization.id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function OrgAvatar({ org }: { org: Organization }) {
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
    <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded text-[13px] font-medium">
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
    </span>
  );
}
