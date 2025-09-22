import React, { useState } from "react";
import { AudioWaveformIcon, Send } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  PromptInput,
  PromptInputButton,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "../ai-elements/prompt-input";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Avatar from "boring-avatars";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-store";
import { customerAuthState } from "@/lib/state/customer.state";
import { chatActions } from "@/lib/state/chat.state";
import { useNavigate } from "@tanstack/react-router";
import { ChatService } from "@/lib/services/chat.service";

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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [customer, currentOrganizationSlug] = useStore(
    customerAuthState,
    (state) => [state.customer, state.currentOrganization]
  );

  // Get the current organization from the customer's organizations
  const currentOrganization = customer?.organizations?.find(
    (org) => org.slug === currentOrganizationSlug
  );

  async function handleSubmit() {
    const v = value.trim();
    if (!v || !customer || !currentOrganization) return;

    setIsLoading(true);
    try {
      // Create chat service
      const chatService = new ChatService({
        onMessage: () => {},
        onToken: () => {},
        onStateChange: () => {},
        onConnectionChange: () => {},
      });

      // Start conversation
      const conversationId = await chatService.startChat(
        currentOrganization.id,
        {
          senderId: customer.id,
          senderName: customer.username,
          senderAvatarUrl: customer.avatarUrl,
        }
      );

      // Set the initial message in chat state
      chatActions.setPendingInitialMessage(v);

      // Navigate to chat page
      navigate({
        to: "/support/$org/c/$chatId" as any,
        params: {
          org: currentOrganizationSlug,
          chatId: conversationId,
        } as any,
        search: { skipHistory: "1" } as any,
      });
    } catch (error) {
      console.error("Failed to start chat:", error);
      // Fallback to onSubmit if provided
      onSubmit?.(v);
    } finally {
      setIsLoading(false);
    }
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
          onSubmit={(_message, event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <PromptInputTextarea
            className="px-5 md:text-base"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="How can I help you?"
            disabled={isLoading}
          />
          <PromptInputToolbar className="p-2.5">
            <PromptInputTools>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar
                    className="mt-3"
                    name="rrr"
                    size={24}
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
                className="rounded-full font-light"
                onClick={handleSubmit}
                variant="default"
                disabled={isLoading || !value.trim()}
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
