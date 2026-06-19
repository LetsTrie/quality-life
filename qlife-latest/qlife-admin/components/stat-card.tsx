import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  accent = "teal",
  loading,
}: {
  label: string;
  value: number | string | null | undefined;
  icon: LucideIcon;
  hint?: string;
  trend?: { value: number; label?: string };
  accent?: "teal" | "blue" | "violet" | "amber";
  loading?: boolean;
}) {
  const accentMap: Record<string, string> = {
    teal: "text-brand-teal bg-brand-teal/10",
    blue: "text-brand-blue bg-brand-blue/10",
    violet: "text-[hsl(262_40%_55%)] bg-[hsl(262_40%_55%/0.12)]",
    amber: "text-warning bg-warning/15",
  };

  const trendUp = (trend?.value ?? 0) >= 0;

  return (
    <Card className="group relative overflow-hidden p-4 transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {value ?? "—"}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            accentMap[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(hint || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                trendUp
                  ? "bg-success/20 text-success"
                  : "bg-destructive/12 text-destructive",
              )}
            >
              {trendUp ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}
              {trend.label ? ` ${trend.label}` : ""}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
