import { cn } from "@/lib/utils";

type ActionCardProps = {
  icon: React.ReactNode;
  title: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  iconClassName?: string;
  titleClassName?: string;
};

export function ActionCard({
  icon,
  title,
  className,
  style,
  onClick,
}: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-input focus-visible:ring-ring/50 hover:bg-accent/40 active:scale-[0.99] flex h-24 w-[180px] flex-col items-start gap-3 rounded-3xl border p-5 text-left transition-all outline-none focus-visible:ring-2",
        className
      )}
      style={style}
    >
      <div className="text-foreground flex size-8 shrink-0 items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className=" leading-tight">{title}</span>
      </div>
    </button>
  );
}
