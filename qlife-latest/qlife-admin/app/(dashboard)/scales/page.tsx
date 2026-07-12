"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type AdminInstrumentSummary } from "@/lib/api";
import { humanize } from "@/lib/utils";

export default function ScalesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminInstrumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<AdminInstrumentSummary[]>("/v1/admin/instruments");
      setRows(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load scales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scales"
        subtitle="Browse, create and update assessment scales — questions, weights, score ranges and actions."
      >
        <Button variant="brand" onClick={() => router.push("/scales/edit")}>
          <Plus className="h-4 w-4" />
          New scale
        </Button>
      </PageHeader>

      <Card>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead className="text-right">Bands</TableHead>
                <TableHead className="text-right">Responses</TableHead>
                <TableHead>Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={ClipboardList}
                      title="No scales yet"
                      description="Create your first assessment scale to get started."
                      action={
                        <Button variant="brand" onClick={() => router.push("/scales/edit")}>
                          <Plus className="h-4 w-4" />
                          New scale
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/scales/detail?id=${r.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium text-foreground">{r.nameBn || r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.slug}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{humanize(r.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      {r.version ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">v{r.version.versionNumber}</span>
                          <StatusBadge status={r.version.status} />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.questionCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.bandCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.responseCount}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={r.isActive ? "success" : "muted"}>
                          {r.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={r.isSelfAssessable ? "info" : "secondary"}>
                          {r.isSelfAssessable ? "Self-assessable" : "Assign-only"}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
