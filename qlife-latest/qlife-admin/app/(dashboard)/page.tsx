"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  Stethoscope,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  BreakdownBars,
  BreakdownDonut,
  SignupTrendChart,
  type Slice,
} from "@/components/charts";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type AdminOverview } from "@/lib/api";
import { humanize } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "hsl(var(--chart-5))",
  PENDING: "hsl(var(--chart-4))",
  REJECTED: "hsl(var(--destructive))",
  REVOKED: "hsl(var(--muted-foreground))",
};

export default function OverviewPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await api<AdminOverview>("/v1/admin/overview"));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load overview");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const c = data?.counts;
  const recentTrend = data?.signupTrend ?? [];
  const recentNew = recentTrend
    .slice(-4)
    .reduce((s, w) => s + w.users + w.professionals, 0);

  const statusSlices: Slice[] = Object.entries(data?.professionalsByStatus ?? {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name: humanize(name),
      value,
      color: STATUS_COLORS[name] ?? "hsl(var(--chart-3))",
    }));

  const typeBars = (data?.professionalsByType ?? [])
    .map((t) => ({ label: humanize(t.type), value: t.count }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="A live snapshot of the QLife community — growth, clinicians, and engagement."
      >
        <Button variant="outline" asChild>
          <Link href="/professionals">
            Review queue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Members"
          value={c?.totalUsers}
          icon={Users}
          accent="teal"
          loading={loading}
          hint={c ? `${c.activeUsers} active` : undefined}
        />
        <StatCard
          label="Professionals"
          value={c?.totalProfessionals}
          icon={Stethoscope}
          accent="blue"
          loading={loading}
          hint={c ? `${c.approvedProfessionals} approved` : undefined}
        />
        <StatCard
          label="Appointments"
          value={c?.totalAppointments}
          icon={CalendarCheck}
          accent="violet"
          loading={loading}
          hint="all time"
        />
        <StatCard
          label="Self-checks"
          value={c?.totalAssessments}
          icon={ClipboardList}
          accent="amber"
          loading={loading}
          hint={c ? `${c.completedAssessments} completed` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Signups</CardTitle>
              <CardDescription>New members & professionals, last 8 weeks</CardDescription>
            </div>
            {!loading && (
              <div className="text-right">
                <div className="text-2xl font-bold tabular-nums">{recentNew}</div>
                <div className="text-xs text-muted-foreground">last 4 weeks</div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <>
                <SignupTrendChart data={recentTrend} />
                <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-chart-1" /> Members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-chart-2" /> Professionals
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification status</CardTitle>
            <CardDescription>Professional applications by state</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full" />
            ) : statusSlices.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No applications yet.
              </p>
            ) : (
              <>
                <BreakdownDonut data={statusSlices} />
                <div className="mt-4 space-y-2">
                  {statusSlices.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="ml-auto font-semibold tabular-nums">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Professionals by type</CardTitle>
            <CardDescription>Composition of the clinician network</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : typeBars.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No professionals yet.
              </p>
            ) : (
              <BreakdownBars data={typeBars} />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-brand-gradient text-white">
          <CardHeader>
            <CardTitle className="text-white">Needs attention</CardTitle>
            <CardDescription className="text-white/80">
              Applications waiting on your review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-12 w-24 bg-white/20" />
            ) : (
              <div className="text-5xl font-bold tabular-nums">
                {c?.pendingProfessionals ?? 0}
              </div>
            )}
            <Button
              variant="secondary"
              asChild
              className="bg-white/95 text-brand-teal hover:bg-white"
            >
              <Link href="/professionals">
                Open review queue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
