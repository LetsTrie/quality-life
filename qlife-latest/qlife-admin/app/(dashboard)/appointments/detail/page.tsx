"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  ExternalLink,
  MessageSquare,
  Stethoscope,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { BackLink, InfoGrid } from "@/components/detail-bits";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type AppointmentDetail } from "@/lib/api";
import { formatDateTime, humanize, initials } from "@/lib/utils";

export default function AppointmentDetailPage() {
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [data, setData] = useState<AppointmentDetail | null>(null);
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
        setData(await api<AppointmentDetail>(`/v1/admin/appointments/${id}`));
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
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-xl lg:col-span-2" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        This appointment could not be loaded.{" "}
        <Link href="/users" className="text-primary underline-offset-4 hover:underline">
          Back
        </Link>
      </p>
    );
  }

  const duration = data.durationMinutes != null ? `${data.durationMinutes} min` : null;

  return (
    <>
      <BackLink href={`/users/detail?id=${data.user.accountId}`} label="Back to member" />

      {/* Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Appointment</h1>
              <StatusBadge status={data.status} />
              <Badge variant="secondary">{humanize(data.modality)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Created {formatDateTime(data.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-brand-soft p-3">
            <PartyChip
              href={`/users/detail?id=${data.user.accountId}`}
              icon={<User className="h-3.5 w-3.5" />}
              name={data.user.displayName ?? data.user.email}
              sub="Member"
            />
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            <PartyChip
              href={`/professionals/detail?id=${data.professional.id}`}
              icon={<Stethoscope className="h-3.5 w-3.5" />}
              name={data.professional.fullName}
              sub={humanize(data.professional.professionType)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Schedule + messages */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoGrid
                items={[
                  { label: "Requested time", value: formatDateTime(data.requestedStartAt) },
                  {
                    label: "Scheduled time",
                    value: data.scheduledStartAt ? formatDateTime(data.scheduledStartAt) : null,
                  },
                  { label: "Duration", value: duration },
                  { label: "Profile shared", value: data.profileShareGranted ? "Yes" : "No" },
                  {
                    label: "Viewed by professional",
                    value: data.viewedByProfessionalAt ? formatDateTime(data.viewedByProfessionalAt) : null,
                  },
                  { label: "Responded", value: data.respondedAt ? formatDateTime(data.respondedAt) : null },
                  { label: "Completed", value: data.completedAt ? formatDateTime(data.completedAt) : null },
                  { label: "Cancelled", value: data.cancelledAt ? formatDateTime(data.cancelledAt) : null },
                ]}
              />
              {data.meetingLink && (
                <a
                  href={data.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Meeting link
                </a>
              )}
              {data.cancellationReason && (
                <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {data.cancellationReason}
                </p>
              )}
            </CardContent>
          </Card>

          {(data.requestMessage || data.professionalMessage) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.requestMessage && <Message from="Member" body={data.requestMessage} />}
                {data.professionalMessage && (
                  <Message from="Professional" body={data.professionalMessage} accent />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {data.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events recorded.</p>
            ) : (
              <ol className="relative space-y-5 border-l pl-6">
                {data.events.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                    <div className="flex flex-wrap items-center gap-1.5">
                      {e.fromStatus && (
                        <>
                          <span className="text-xs text-muted-foreground">{humanize(e.fromStatus)}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </>
                      )}
                      <StatusBadge status={e.toStatus} dot={false} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(e.createdAt)}
                      {e.actor ? ` · ${e.actor.email}` : ""}
                    </div>
                    {e.note && <p className="mt-1 text-sm">{e.note}</p>}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function PartyChip({
  href,
  icon,
  name,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  name: string;
  sub: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2 transition-opacity hover:opacity-80">
      <Avatar className="h-9 w-9">
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{name}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {icon}
          {sub}
        </div>
      </div>
    </Link>
  );
}

function Message({
  from,
  body,
  accent,
}: {
  from: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent ? "rounded-lg rounded-tr-sm bg-brand-soft p-3" : "rounded-lg rounded-tl-sm bg-muted p-3"
      }
    >
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{from}</p>
      <p className="text-sm leading-relaxed">{body}</p>
    </div>
  );
}

