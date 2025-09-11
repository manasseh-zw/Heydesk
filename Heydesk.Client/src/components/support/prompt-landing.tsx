import React, { useState, type FormEvent } from "react";
import { AudioWaveformIcon, Send } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  PromptInput,
  PromptInputButton,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type PromptInputMessage,
} from "../ai-elements/prompt-input";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Avatar from "boring-avatars";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-store";
import { customerAuthState } from "@/lib/state/customer.state";

type Props = {
  onSubmit?: (text: string) => void;
};

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

const OrgAvatar = ({ org }: { org: { name: string; url?: string } }) => {
  const [useIcon, setUseIcon] = React.useState(true);
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
          className="size-5 object-fill"
          onError={() => setUseIcon(false)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </Square>
  );
};

export function PromptLanding({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [customer, currentOrganizationSlug] = useStore(
    customerAuthState,
    (state) => [state.customer, state.currentOrganization]
  );

  // Get the current organization from the customer's organizations
  const currentOrganization = customer?.organizations?.find(
    (org) => org.slug === currentOrganizationSlug
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onSubmit?.(v);
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <div className="flex items-center gap-3 mb-12">
        {currentOrganization ? (
          <>
            <OrgAvatar org={currentOrganization} />
            <div className="text-2xl font-light">
              {currentOrganization.name} <span className="">support</span>
            </div>
          </>
        ) : (
          <>
            <Logo className="h-8 w-auto" />
            <div className="text-2xl font-light">
              Hey<span className="text-lime-500">desk</span>
            </div>
          </>
        )}
      </div>
      <div className="w-full max-w-2xl">
        <PromptInput
          className="divide-y-0 rounded-[28px] w-full"
          onSubmit={function (
            message: PromptInputMessage,
            event: FormEvent<HTMLFormElement>
          ): void {
            throw new Error("Function not implemented.");
          }}
        >
          <PromptInputTextarea
            className="px-5 md:text-base"
            onChange={(event) => {}}
            placeholder="How can I help you?"
          />
          <PromptInputToolbar className="p-2.5">
            <PromptInputTools>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar
                    className="mt-3"
                    name="eee"
                    size={28}
                    colors={[
                      "#0ea5e9",
                      "#22c55e",
                      "#f59e0b",
                      "#6366f1",
                      "#ec4899",
                    ]}
                  />
                </DropdownMenuTrigger>
                {/* <DropdownMenuContent>Agent</DropdownMenuContent> */}
              </DropdownMenu>
            </PromptInputTools>
            <div className="flex items-center gap-2">
              <PromptInputButton
                className="rounded-full bg-foreground font-medium text-background"
                onClick={() => {}}
                variant="default"
              >
                <AudioWaveformIcon size={16} />
              </PromptInputButton>
              <PromptInputButton
                className="rounded-full  font-light "
                onClick={() => {}}
                variant="default"
              >
                <Send size={16} />
              </PromptInputButton>
            </div>
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
