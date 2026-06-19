"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardList, Gauge, Info, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { BackLink } from "@/components/detail-bits";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type AssessmentDetail, type AssessmentQuestion } from "@/lib/api";
import { cn, formatDateTime, humanize } from "@/lib/utils";

export default function AssessmentDetailPage() {
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [data, setData] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setData(null);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setData(await api<AssessmentDetail>(`/v1/admin/assessments/${id}`));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-xl lg:col-span-2" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        This assessment could not be loaded.{" "}
        <Link href="/users" className="text-primary underline-offset-4 hover:underline">
          Back
        </Link>
      </p>
    );
  }

  const bandColor = data.scoringBand?.colorHex ?? undefined;
  const pct =
    data.rawScore != null && data.maxScore
      ? Math.max(0, Math.min(100, (data.rawScore / data.maxScore) * 100))
      : null;
  const answered = data.questions.filter((q) => q.answered).length;

  return (
    <>
      <BackLink href={`/users/detail?id=${data.subject.accountId}`} label="Back to member" />

      {/* Header */}
      <Card>
        <CardContent className="space-y-2 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">{data.instrument.name}</h1>
            <StatusBadge status={data.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              Taken by{" "}
              <Link
                href={`/users/detail?id=${data.subject.accountId}`}
                className="font-medium text-foreground hover:underline"
              >
                {data.subject.displayName ?? data.subject.email}
              </Link>
            </span>
            <Badge variant="secondary">{humanize(data.source)}</Badge>
            <Badge variant="outline" className="font-normal">
              {humanize(data.instrument.category)}
            </Badge>
            {data.assignedByProfessional && <span>Assigned by {data.assignedByProfessional}</span>}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-xs text-muted-foreground">
            <span>Started {formatDateTime(data.startedAt)}</span>
            <span>Completed {formatDateTime(data.completedAt)}</span>
            <span>
              v{data.version.versionNumber} · {data.version.locale} ·{" "}
              {humanize(data.version.scoringMethod)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Score + band */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <div className="text-4xl font-bold tabular-nums">
                  {data.rawScore ?? "—"}
                  {data.maxScore != null && (
                    <span className="text-xl font-medium text-muted-foreground"> / {data.maxScore}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Raw score</p>
              </div>
              {data.normalizedScore != null && (
                <div>
                  <div className="text-2xl font-semibold tabular-nums">{data.normalizedScore}</div>
                  <p className="text-xs text-muted-foreground">Normalized</p>
                </div>
              )}
              {data.severityLabel && (
                <div>
                  <Badge
                    variant="outline"
                    className="text-sm"
                    style={bandColor ? { borderColor: bandColor, color: bandColor } : undefined}
                  >
                    {data.severityLabel}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">Severity</p>
                </div>
              )}
            </div>
            {pct != null && (
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${pct}%`, ...(bandColor ? { background: bandColor } : {}) }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interpretation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.scoringBand ? (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: bandColor ?? "hsl(var(--primary))" }}
                  />
                  <span className="font-semibold">{data.scoringBand.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Band range {data.scoringBand.minScore}–{data.scoringBand.maxScore} · rank{" "}
                  {data.scoringBand.severityRank} · {humanize(data.scoringBand.recommendedAction)}
                </p>
                {data.scoringBand.advice && <p className="leading-relaxed">{data.scoringBand.advice}</p>}
              </>
            ) : (
              <p className="text-muted-foreground">No severity band matched this score.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {(data.version.instructions || data.version.attribution) && (
        <Card>
          <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              {data.version.instructions && <p>{data.version.instructions}</p>}
              {data.version.attribution && <p className="text-xs">{data.version.attribution}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question-by-question breakdown */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Responses</CardTitle>
          <span className="text-sm text-muted-foreground">
            {answered} / {data.questions.length} answered
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">This instrument version has no questions on record.</p>
          ) : (
            data.questions.map((q) => <QuestionBlock key={q.id} q={q} />)
          )}
        </CardContent>
      </Card>
    </>
  );
}

function QuestionBlock({ q }: { q: AssessmentQuestion }) {
  const isChoice = q.options.length > 0;
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {q.position}
          </span>
          <div className="space-y-1.5">
            <p className="font-medium leading-snug">{q.prompt}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {q.domain && (
                <Badge variant="muted" className="font-normal">
                  {q.domain}
                </Badge>
              )}
              {q.isReverseScored && (
                <Badge variant="warning" className="font-normal">
                  <RotateCcw className="h-3 w-3" />
                  Reverse scored
                </Badge>
              )}
              {!q.answered && (
                <Badge variant="outline" className="font-normal">
                  Unanswered
                </Badge>
              )}
            </div>
          </div>
        </div>
        {q.weightApplied != null && (
          <div className="shrink-0 text-right">
            <div className="text-lg font-bold tabular-nums text-primary">{q.weightApplied}</div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">weight</div>
          </div>
        )}
      </div>

      {isChoice ? (
        <ul className="mt-3 space-y-1.5 pl-9">
          {q.options.map((o) => (
            <li
              key={o.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
                o.selected
                  ? "border-primary/40 bg-primary/5 font-medium"
                  : "border-transparent bg-muted/40 text-muted-foreground",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    o.selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
                  )}
                >
                  {o.selected && <Check className="h-3 w-3" />}
                </span>
                {o.label}
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="text-xs text-muted-foreground">val {o.value} · </span>
                <span className={o.selected ? "text-primary" : ""}>wt {o.weight ?? "—"}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 pl-9">
          {q.valueText != null ? (
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm">{q.valueText}</p>
          ) : q.valueNumeric != null ? (
            <p className="text-sm tabular-nums">
              Value: <span className="font-semibold">{q.valueNumeric}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No response</p>
          )}
        </div>
      )}
    </div>
  );
}

