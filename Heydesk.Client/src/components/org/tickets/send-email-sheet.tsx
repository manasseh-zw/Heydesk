import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MinimalTiptap } from "@/components/ui/shadcn-io/minimal-tiptap";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { SendIcon } from "lucide-react";

export function SendEmailSheet({
  defaultSubject,
  defaultTo,
}: {
  defaultSubject?: string;
  defaultTo?: string;
}) {
  const [subject, setSubject] = useState<string>(defaultSubject || "");
  const [to, setTo] = useState<string>(defaultTo || "");
  const [content, setContent] = useState<string>("");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full" variant="default">
          Send support email
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl px-8  py-5 rounded-l-2xl">
        <SheetHeader className="px-0">
          <SheetTitle className="font-light text-xl">
            Compose support email
          </SheetTitle>
          <SheetDescription>
            Write a message to the customer. You can edit rich text below.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <Label htmlFor="email-to" className="text-sm text-muted-foreground">
              To
            </Label>
            <Input
              id="email-to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="customer@example.com"
              type="email"
            />
          </div>
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <Label
              htmlFor="email-subject"
              className=" text-sm text-muted-foreground"
            >
              Subject
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              type="text"
            />
          </div>
          <div className="py-5">
            <MinimalTiptap
              className="min-h-[200px]"
              content={content}
              onChange={setContent}
              placeholder="Write your message..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" disabled={!to || !subject || !content.trim()}>
              <span className="flex items-center gap-2">
                Send email <SendIcon className="size-4" />
              </span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
