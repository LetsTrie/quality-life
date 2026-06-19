"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, ChevronRight, Download, Plus, Search, Stethoscope, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { SortableHead, useTableSort } from "@/components/sortable-table";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api, type Paginated } from "@/lib/api";
import { humanize, initials } from "@/lib/utils";

function exportProfessionalsCSV(rows: ProfessionalRow[]) {
  if (!rows.length) return;
  const headers = ["Name", "Email", "Profession", "Verification", "Account Status"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        JSON.stringify(r.fullName),
        JSON.stringify(r.email),
        r.professionType,
        r.verification?.status ?? "",
        r.accountStatus,
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "professionals.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface ProfessionalRow {
  id: string;
  accountId: string;
  fullName: string;
  professionType: string;
  email: string;
  accountStatus: string;
  isOnboardingComplete: boolean;
  verification: { id: string; status: string } | null;
}

type SortKey = "fullName" | "professionType" | "verification" | "accountStatus";

const STATUSES = ["", "PENDING", "APPROVED", "REJECTED", "REVOKED"];
const PROFESSION_TYPES = [
  "CLINICAL_PSYCHOLOGIST",
  "ASSISTANT_CLINICAL_PSYCHOLOGIST",
  "PSYCHIATRIST",
  "COUNSELOR",
  "OTHER",
];

export default function ProfessionalsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ProfessionalRow[]>([]);
  const [meta, setMeta] = useState<Paginated<ProfessionalRow>["pagination"] | null>(
    null,
  );
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ProfessionalRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("page", String(page));
      const res = await api<Paginated<ProfessionalRow>>(
        `/v1/admin/professionals?${params}`,
      );
      setRows(res.items);
      setMeta(res.pagination);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function review(
    verificationId: string,
    decision: "APPROVED" | "REJECTED",
    decisionNote?: string,
  ) {
    setActingId(verificationId);
    try {
      await api(`/v1/professionals/verifications/${verificationId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision, decisionNote }),
      });
      toast.success(
        decision === "APPROVED" ? "Professional approved" : "Application rejected",
      );
      setRejectTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActingId(null);
    }
  }

  const filtered = search
    ? rows.filter(
        (r) =>
          r.fullName.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const { sorted, sort, toggle } = useTableSort<ProfessionalRow, SortKey>(filtered, {
    fullName: (r) => r.fullName.toLowerCase(),
    professionType: (r) => r.professionType,
    verification: (r) => r.verification?.status ?? "",
    accountStatus: (r) => r.accountStatus,
  });

  return (
    <>
      <PageHeader
        title="Professionals"
        subtitle="Review applications and manage clinician accounts."
      >
        <Button variant="brand" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Add professional
        </Button>
      </PageHeader>

      <Card>
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={status || "ALL"}
            onValueChange={(v) => {
              setStatus(v === "ALL" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s || "ALL"} value={s || "ALL"}>
                  {s ? humanize(s) : "All statuses"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportProfessionalsCSV(sorted)}
            disabled={sorted.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHead sortKey="fullName" sort={sort} onSort={toggle}>
                Professional
              </SortableHead>
              <SortableHead sortKey="professionType" sort={sort} onSort={toggle}>
                Type
              </SortableHead>
              <SortableHead sortKey="verification" sort={sort} onSort={toggle}>
                Verification
              </SortableHead>
              <SortableHead sortKey="accountStatus" sort={sort} onSort={toggle}>
                Account
              </SortableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={Stethoscope}
                    title="No professionals found"
                    description={
                      search || status
                        ? "Try clearing your filters or search."
                        : "Add your first clinician to get started."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((r) => {
                const isPending = r.verification?.status === "PENDING";
                return (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/professionals/detail?id=${r.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{initials(r.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{r.fullName}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {r.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{humanize(r.professionType)}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.verification?.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.accountStatus} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {isPending && r.verification ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={actingId === r.verification.id}
                            onClick={() => review(r.verification!.id, "APPROVED")}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            disabled={actingId === r.verification.id}
                            onClick={() => setRejectTarget(r)}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <Pagination meta={meta} itemLabel="professionals" onPageChange={setPage} />
      </Card>

      <CreateProfessionalDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={() => {
          setShowCreate(false);
          setPage(1);
          load();
        }}
      />

      <RejectDialog
        target={rejectTarget}
        busy={!!rejectTarget && actingId === rejectTarget.verification?.id}
        onOpenChange={(v) => !v && setRejectTarget(null)}
        onConfirm={(note) =>
          rejectTarget?.verification &&
          review(rejectTarget.verification.id, "REJECTED", note)
        }
      />
    </>
  );
}

function RejectDialog({
  target,
  busy,
  onOpenChange,
  onConfirm,
}: {
  target: ProfessionalRow | null;
  busy: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (note?: string) => void;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (target) setNote("");
  }, [target]);

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
            <X className="h-5 w-5" />
          </div>
          <DialogTitle>Reject application?</DialogTitle>
          <DialogDescription>
            You&rsquo;re about to reject{" "}
            <span className="font-medium text-foreground">{target?.fullName}</span>
            &rsquo;s verification. They will not be listed to users. This can be
            revisited later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="reject-note">Reason (optional)</Label>
          <Textarea
            id="reject-note"
            placeholder="Add an internal note about why this was rejected…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => onConfirm(note.trim() || undefined)}
          >
            {busy ? "Rejecting…" : "Reject application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateProfessionalDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [professionType, setProfessionType] = useState(PROFESSION_TYPES[0]);
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  function reset() {
    setEmail("");
    setFullName("");
    setProfessionType(PROFESSION_TYPES[0]);
    setDesignation("");
    setPhone("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/v1/admin/professionals", {
        method: "POST",
        body: JSON.stringify({
          email,
          fullName,
          professionType,
          designation: designation || undefined,
          phone: phone || undefined,
        }),
      });
      toast.success(`${fullName} added`);
      reset();
      onCreated();
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-teal">
            <UserPlus className="h-5 w-5" />
          </div>
          <DialogTitle>Add a professional</DialogTitle>
          <DialogDescription>
            They&rsquo;ll link to this email on their first sign-in. The account is
            pre-approved.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Profession</Label>
              <Select value={professionType} onValueChange={setProfessionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSION_TYPES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {humanize(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                placeholder="Optional"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Optional"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={busy}>
              {busy ? "Adding…" : "Add professional"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
