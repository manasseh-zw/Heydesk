import { useState, type FormEvent } from "react";
import {
  AudioWaveformIcon,
  CameraIcon,
  ChevronDownIcon,
  FileIcon,
  ImageIcon,
  LightbulbIcon,
  PaperclipIcon,
  ScreenShareIcon,
  SearchIcon,
  Send,
} from "lucide-react";
import { Logo } from "@/components/logo";
import {
  PromptInput,
  PromptInputButton,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type PromptInputMessage,
} from "../ai-elements/prompt-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Avatar from "boring-avatars";

type Props = {
  onSubmit?: (text: string) => void;
};

export function PromptLanding({ onSubmit }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onSubmit?.(v);
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <div className="flex items-center gap-3 mb-12">
        <Logo className="h-8 w-auto" />
        <div className="text-3xl font-light">
          Hey<span className="text-lime-500">desk</span>
        </div>
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
                    name="maya"
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
