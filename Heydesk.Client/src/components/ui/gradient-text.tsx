import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type GradientTextProps = {
  children: ReactNode;
  className?: string;
};

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-lime bg-clip-text text-transparent font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}
