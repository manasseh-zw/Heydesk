import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Mic, Paperclip } from "lucide-react";
import { Logo } from "@/components/logo";

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
      <div className="flex items-center gap-3 mb-6">
        <Logo className="h-8 w-auto" />
        <div className="text-3xl font-light">
          Hey<span className="text-lime-500">desk</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="relative">
          <Input
            className="h-14 rounded-2xl pl-12 pr-24 text-base"
            placeholder="What do you need help with?"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon">
              <Mic className="h-5 w-5" />
            </Button>
            <Button type="submit" className="rounded-xl">
              Ask
            </Button>
          </div>
        </div>
      </form>
      <div className="text-sm text-muted-foreground mt-4">
        Ask about your tickets, billing, or product usage.
      </div>
    </div>
  );
}
