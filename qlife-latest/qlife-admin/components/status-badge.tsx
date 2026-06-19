import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn, humanize } from "@/lib/utils";

type Variant = NonNullable<BadgeProps["variant"]>;

// Maps the backend's UPPER_SNAKE status enums (verification, account,
// assessment, appointment) onto a small set of tones.
const TONE: Record<string, Variant> = {
  // positive
  APPROVED: "success",
  ACTIVE: "success",
  ACCEPTED: "success",
  COMPLETED: "success",
  // pending / attention
  PENDING: "warning",
  PENDING_VERIFICATION: "warning",
  ASSIGNED: "warning",
  RESCHEDULE_PROPOSED: "warning",
  // in flight / informational
  IN_PROGRESS: "info",
  REQUESTED: "info",
  VIEWED: "info",
  // negative
  REJECTED: "destructive",
  SUSPENDED: "destructive",
  DECLINED: "destructive",
  NO_SHOW: "destructive",
  CANCELLED_BY_USER: "destructive",
  CANCELLED_BY_PROFESSIONAL: "destructive",
  // neutral / faded
  REVOKED: "muted",
  DEACTIVATED: "muted",
  DELETED: "muted",
  EXPIRED: "muted",
  CANCELLED: "muted",
};

const DOT: Record<Variant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-accent-foreground",
  muted: "bg-muted-foreground",
  default: "bg-primary",
  secondary: "bg-muted-foreground",
  outline: "bg-muted-foreground",
};

export function statusTone(status?: string | null): Variant {
  if (!status) return "muted";
  return TONE[status] ?? "secondary";
}

export function StatusBadge({
  status,
  dot = true,
}: {
  status?: string | null;
  dot?: boolean;
}) {
  const tone = statusTone(status);
  return (
    <Badge variant={tone}>
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT[tone])} />
      )}
      {humanize(status)}
    </Badge>
  );
}
