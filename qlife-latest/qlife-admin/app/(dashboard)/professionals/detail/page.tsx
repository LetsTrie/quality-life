"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarCheck,
  Check,
  ChevronRight,
  ClipboardList,
  Mail,
  Phone,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { BackLink, InfoGrid } from "@/components/detail-bits";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type ProfessionalDetail } from "@/lib/api";
import { formatDate, formatDateTime, humanize, initials } from "@/lib/utils";

const WEEKDAY_ORDER = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export default function ProfessionalDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [data, setData] = useState<ProfessionalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setData(null);
      return;
    }
    try {
      setLoading(true);
      setData(await api<ProfessionalDetail>(`/v1/admin/professionals/${id}`));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // The verification awaiting a decision, if any.
  const pendingVerification = data?.verifications.find(
    (v) => v.status === "PENDING",
  );

  async function review(
    verificationId: string,
    decision: "APPROVED" | "REJECTED",
    decisionNote?: string,
  ) {
    setActing(true);
    try {
      await api(`/v1/professionals/verifications/${verificationId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision, decisionNote }),
      });
      toast.success(
        decision === "APPROVED" ? "Professional approved" : "Application rejected",
      );
      setRejectOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        This professional could not be loaded.{" "}
        <Link
          href="/professionals"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to professionals
        </Link>
      </p>
    );
  }

  const fee = data.feeAmount != null ? `${data.feeAmount} ${data.feeCurrency}` : null;
  const availabilityByDay = [...data.availability].sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday),
  );

  return (
    <>
      <BackLink href="/professionals" label="Back to professionals" />

      {/* Identity card */}
      <Card className="overflow-hidden">
        <div className="relative bg-brand-gradient px-5 py-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.07]" />
          <div className="pointer-events-none absolute right-10 top-6 h-16 w-16 rounded-full bg-white/[0.05]" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
            <Avatar className="h-14 w-14 shrink-0 ring-2 ring-white/30">
              <AvatarFallback className="bg-white/20 text-base font-semibold text-white">
                {initials(data.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">{data.fullName}</h1>
                <Badge className="border-transparent bg-white/90 text-slate-900">
                  {humanize(data.professionType)}
                </Badge>
                {/* Solid pills read clearly on the brand gradient — the
                    translucent success/info variants were too faint here. */}
                <StatusBadge
                  status={data.accountStatus}
                  className="border-transparent bg-white text-slate-900"
                />
                {data.isVisible && (
                  <Badge className="border-transparent bg-white/90 text-slate-900">Listed</Badge>
                )}
                {data.acceptingNewClients && (
                  <Badge className="border-transparent bg-amber-400 text-slate-900">
                    Accepting clients
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-white/75">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {data.email}
                </span>
                {data.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {data.phone}
                  </span>
                )}
                {data.designation && <span>{data.designation}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 border-t px-5 py-2.5 text-xs text-muted-foreground">
          <span>Joined {formatDate(data.createdAt)}</span>
          <span>Last login {formatDateTime(data.lastLoginAt)}</span>
          <span>Onboarding {data.isOnboardingComplete ? "complete" : "incomplete"}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Appointments"
          value={data.stats.appointmentCount}
          icon={CalendarCheck}
          accent="teal"
        />
        <StatCard
          label="Active clients"
          value={data.stats.activeClients}
          icon={UsersIcon}
          accent="blue"
        />
        <StatCard
          label="Assessments assigned"
          value={data.stats.assignedAssessments}
          icon={ClipboardList}
          accent="violet"
        />
      </div>

      {/* Profile details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InfoGrid
            items={[
              { label: "Gender", value: data.gender ? humanize(data.gender) : null },
              { label: "BMDC registration", value: data.bmdcRegistrationNo },
              { label: "Graduation batch", value: data.graduationBatch },
              { label: "Workplace", value: data.workplace },
              {
                label: "Experience",
                value: data.yearsOfExperience != null ? `${data.yearsOfExperience} years` : null,
              },
              { label: "Consultation fee", value: fee },
              {
                label: "Weekly capacity",
                value:
                  data.maxWeeklyClients != null
                    ? `${data.avgWeeklyClients ?? "—"} / ${data.maxWeeklyClients} clients`
                    : null,
              },
              { label: "Timezone", value: data.timezone },
            ]}
          />
          {(data.educationSummary || data.bio) && <Separator />}
          {data.educationSummary && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Education
              </p>
              <p className="text-sm">{data.educationSummary}</p>
            </div>
          )}
          {data.bio && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bio
              </p>
              <p className="text-sm leading-relaxed">{data.bio}</p>
            </div>
          )}
          {data.specializations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Specializations
              </p>
              <div className="flex flex-wrap gap-2">
                {data.specializations.map((s) => (
                  <Badge key={s.name} variant="secondary">
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {availabilityByDay.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Weekly availability
              </p>
              <div className="flex flex-wrap gap-2">
                {availabilityByDay.map((a, i) => (
                  <Badge key={i} variant="outline" className="font-normal">
                    {humanize(a.weekday).slice(0, 3)} · {a.startTime}–{a.endTime}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification history */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Verification history
            </CardTitle>
            {pendingVerification && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={acting}
                  onClick={() => review(pendingVerification.id, "APPROVED")}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={acting}
                  onClick={() => setRejectOpen(true)}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.verifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verification records.</p>
          ) : (
            <ol className="relative space-y-5 border-l pl-6">
              {data.verifications.map((v) => (
                <li key={v.id} className="relative">
                  <span className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={v.status} />
                    <span className="text-xs text-muted-foreground">
                      submitted {formatDate(v.submittedAt)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {v.reviewedAt ? (
                      <>
                        Reviewed {formatDate(v.reviewedAt)}
                        {v.reviewedBy ? ` by ${v.reviewedBy}` : ""}
                      </>
                    ) : (
                      "Awaiting review"
                    )}
                  </div>
                  {v.decisionNote && (
                    <p className="mt-1 rounded-md bg-muted px-3 py-2 text-sm">{v.decisionNote}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Recent appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent appointments</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Client</TableHead>
                <TableHead>Modality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentAppointments.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No appointments yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.recentAppointments.map((ap) => (
                  <TableRow
                    key={ap.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/appointments/detail?id=${ap.id}`)}
                  >
                    <TableCell className="pl-6 font-medium">{ap.user ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{humanize(ap.modality)}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ap.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(ap.requestedStartAt)}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RejectDialog
        open={rejectOpen}
        name={data.fullName}
        busy={acting}
        onOpenChange={setRejectOpen}
        onConfirm={(note) =>
          pendingVerification && review(pendingVerification.id, "REJECTED", note)
        }
      />
    </>
  );
}

function RejectDialog({
  open,
  name,
  busy,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  name: string;
  busy: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (note?: string) => void;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
            <X className="h-5 w-5" />
          </div>
          <DialogTitle>Reject application?</DialogTitle>
          <DialogDescription>
            You&rsquo;re about to reject{" "}
            <span className="font-medium text-foreground">{name}</span>
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

