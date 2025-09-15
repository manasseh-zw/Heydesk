import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BoringAvatar from "boring-avatars";

export function CustomerAvatar({
  name,
  email,
  avatarUrl,
  size = 40,
}: {
  name: string;
  email: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  return (
    <span className="flex items-center gap-2">
      <Avatar className="rounded-full" style={{ width: size, height: size }}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback className="p-0">
          <BoringAvatar
            name={name || "User"}
            size={size}
            variant="beam"
            colors={["#0ea5e9", "#22c55e", "#f59e0b", "#6366f1", "#ec4899"]}
          />
        </AvatarFallback>
      </Avatar>
      <span>
        <span className="block font-light leading-tight">{name}</span>
        <span className="text-muted-foreground mt-0.5 block text-xs">
          {email}
        </span>
      </span>
    </span>
  );
}
