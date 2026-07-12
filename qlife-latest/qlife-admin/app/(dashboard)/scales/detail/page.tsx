"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { BackLink, InfoGrid } from "@/components/detail-bits";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type AdminInstrumentDetail } from "@/lib/api";
import { humanize } from "@/lib/utils";

export default function ScaleDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [scale, setScale] = useState<AdminInstrumentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setScale(await api<AdminInstrumentDetail>(`/v1/admin/instruments/${id}`));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load scale");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }
  if (!scale) {
    return (
      <div className="space-y-4">
        <BackLink href="/scales" label="Back to scales" />
        <p className="text-sm text-muted-foreground">Scale not found.</p>
      </div>
    );
  }

  const v = scale.version;
  const contentTitle = (cid: string | null) =>
    scale.contentOptions.find((c) => c.id === cid)?.title ?? null;

  return (
    <div className="space-y-6">
      <BackLink href="/scales" label="Back to scales" />
      <PageHeader title={scale.nameBn || scale.name} subtitle={scale.name}>
        <Button variant="brand" onClick={() => router.push(`/scales/edit?id=${scale.id}`)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{humanize(scale.category)}</Badge>
            {v && <StatusBadge status={v.status} />}
            <Badge variant={scale.isActive ? "success" : "muted"}>
              {scale.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={scale.isSelfAssessable ? "info" : "secondary"}>
              {scale.isSelfAssessable ? "Self-assessable" : "Assign-only"}
            </Badge>
          </div>
          <InfoGrid
            items={[
              { label: "Slug", value: scale.slug },
              { label: "Version", value: v ? `v${v.versionNumber} (${v.locale})` : "—" },
              { label: "Scoring method", value: v ? humanize(v.scoringMethod) : "—" },
              { label: "Normalization max", value: v?.normalizationMax ?? null },
              { label: "Responses recorded", value: String(scale.responseCount) },
              { label: "Attribution", value: v?.attribution ?? null },
              { label: "Description", value: scale.description ?? null },
              { label: "Instructions", value: v?.instructions ?? null },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question × answer weights</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightMatrix questions={scale.questions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score ranges & actions</CardTitle>
        </CardHeader>
        <CardContent>
          {scale.bands.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scoring bands defined.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Range</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead className="text-right">Severity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Resource</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scale.bands.map((b, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {b.minScore} – {b.maxScore}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          {b.colorHex && (
                            <span
                              className="h-3 w-3 rounded-full border"
                              style={{ backgroundColor: b.colorHex }}
                            />
                          )}
                          {b.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{b.severityRank}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{humanize(b.recommendedAction)}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md text-sm text-muted-foreground">
                        {b.advice ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {contentTitle(b.recommendedContentId) ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Sparse question × answer weight matrix. Columns are the union of distinct
 * answer options across the scale (keyed by value+label); a cell shows that
 * question's weight for the column's option, blank when the question doesn't
 * offer it. Uniform Likert scales render as a full grid; scales with
 * per-question options render sparsely.
 */
function WeightMatrix({
  questions,
}: {
  questions: AdminInstrumentDetail["questions"];
}) {
  const columns = useMemo(() => {
    const map = new Map<string, { label: string; value: number }>();
    for (const q of questions) {
      for (const o of q.options) {
        const key = `${o.value}||${o.label}`;
        if (!map.has(key)) map.set(key, { label: o.label, value: o.value });
      }
    }
    return [...map.entries()]
      .map(([key, col]) => ({ key, ...col }))
      .sort((a, b) => a.value - b.value);
  }, [questions]);

  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">No questions defined.</p>;
  }

  const weightFor = (
    q: AdminInstrumentDetail["questions"][number],
    colKey: string,
  ) => {
    const opt = q.options.find((o) => `${o.value}||${o.label}` === colKey);
    return opt ? opt.weight : null;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 min-w-[16rem] bg-card">Question</TableHead>
            {columns.map((c) => (
              <TableHead key={c.key} className="text-center whitespace-nowrap">
                <div>{c.label}</div>
                <div className="text-[10px] font-normal text-muted-foreground">value {c.value}</div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q, i) => (
            <TableRow key={i}>
              <TableCell className="sticky left-0 z-10 bg-card align-top text-sm">
                <span className="text-muted-foreground">{i + 1}.</span> {q.prompt}
                {q.isReverseScored && (
                  <Badge variant="warning" className="ml-2">
                    reverse
                  </Badge>
                )}
              </TableCell>
              {columns.map((c) => {
                const w = weightFor(q, c.key);
                return (
                  <TableCell key={c.key} className="text-center tabular-nums">
                    {w === null ? (
                      <span className="text-muted-foreground/40">·</span>
                    ) : (
                      w
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
