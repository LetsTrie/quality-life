"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Mail,
  Phone,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";

import { BackLink } from "@/components/detail-bits";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { formatDate, formatDateTime, humanize, initials } from "@/lib/utils";

interface UserDetail {
  account: {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt: string | null;
  };
  profile: {
    displayName: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    phone: string | null;
  } | null;
  assessments: {
    id: string;
    status: string;
    source: string;
    severityLabel: string | null;
    rawScore: string | null;
    completedAt: string | null;
    instrument: string | null;
  }[];
  appointments: {
    id: string;
    status: string;
    modality: string;
    requestedStartAt: string;
    professional: string | null;
  }[];
  contentViews: {
    contentKey: string;
    title: string;
    viewCount: number;
    completed: boolean;
    lastViewedAt: string;
  }[];
  stats: {
    assessmentCount: number;
    appointmentCount: number;
    contentViewCount: number;
  };
}

export default function UserDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [data, setData] = useState<UserDetail | null>(null);
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
        setData(await api<UserDetail>(`/v1/admin/users/${id}`));
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
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-32 w-full rounded-xl" />
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
        This user could not be loaded.{" "}
        <Link href="/users" className="text-primary underline-offset-4 hover:underline">
          Back to users
        </Link>
      </p>
    );
  }

  const name = data.profile?.displayName ?? data.account.email;
  const p = data.profile;

  return (
    <>
      <BackLink href="/users" label="Back to users" />

      {/* Identity card */}
      <Card className="overflow-hidden">
        <div className="relative bg-brand-gradient px-5 py-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.07]" />
          <div className="pointer-events-none absolute right-10 top-6 h-16 w-16 rounded-full bg-white/[0.05]" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
            <Avatar className="h-14 w-14 shrink-0 ring-2 ring-white/30">
              <AvatarFallback className="bg-white/20 text-base font-semibold text-white">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold tracking-tight text-white">{name}</h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-white/75">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {data.account.email}
                </span>
                {p?.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {p.phone}
                  </span>
                )}
                {p?.gender && <span>{humanize(p.gender)}</span>}
                {p?.dateOfBirth && <span>Born {formatDate(p.dateOfBirth)}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 border-t px-5 py-2.5 text-xs text-muted-foreground">
          <span>Joined {formatDate(data.account.createdAt)}</span>
          <span>Last login {formatDateTime(data.account.lastLoginAt)}</span>
          <span>Role {humanize(data.account.role)}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Self-checks"
          value={data.stats.assessmentCount}
          icon={ClipboardList}
          accent="teal"
        />
        <StatCard
          label="Appointments"
          value={data.stats.appointmentCount}
          icon={CalendarCheck}
          accent="blue"
        />
        <StatCard
          label="Resources viewed"
          value={data.stats.contentViewCount}
          icon={PlayCircle}
          accent="violet"
        />
      </div>

      <Tabs defaultValue="assessments">
        <TabsList>
          <TabsTrigger value="assessments">
            Self-checks
            <Badge variant="muted">{data.assessments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="appointments">
            Appointments
            <Badge variant="muted">{data.appointments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resources">
            Resources
            <Badge variant="muted">{data.contentViews.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments">
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Instrument</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.assessments.length === 0 ? (
                  <EmptyRow colSpan={7} text="No self-checks yet." />
                ) : (
                  data.assessments.map((a) => (
                    <TableRow
                      key={a.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/assessments/detail?id=${a.id}`)}
                    >
                      <TableCell className="font-medium">{a.instrument ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{humanize(a.source)}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                      <TableCell>{a.severityLabel ?? "—"}</TableCell>
                      <TableCell className="tabular-nums">{a.rawScore ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(a.completedAt)}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Professional</TableHead>
                  <TableHead>Modality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.appointments.length === 0 ? (
                  <EmptyRow colSpan={5} text="No appointments yet." />
                ) : (
                  data.appointments.map((ap) => (
                    <TableRow
                      key={ap.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/appointments/detail?id=${ap.id}`)}
                    >
                      <TableCell className="font-medium">{ap.professional ?? "—"}</TableCell>
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
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last viewed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.contentViews.length === 0 ? (
                  <EmptyRow colSpan={4} text="No resources viewed yet." />
                ) : (
                  data.contentViews.map((v) => (
                    <TableRow key={v.contentKey}>
                      <TableCell className="font-medium">{v.title}</TableCell>
                      <TableCell className="tabular-nums">{v.viewCount}</TableCell>
                      <TableCell>
                        <Badge variant={v.completed ? "success" : "muted"}>
                          {v.completed ? "Completed" : "Started"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(v.lastViewedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
        {text}
      </TableCell>
    </TableRow>
  );
}

