"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Download, Search, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { SortableHead, useTableSort } from "@/components/sortable-table";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type Paginated } from "@/lib/api";
import { formatDate, initials, relativeTime } from "@/lib/utils";

function exportUsersCSV(rows: UserRow[]) {
  if (!rows.length) return;
  const headers = ["Name", "Email", "Status", "Joined", "Last Login"];
  const lines = [
    headers.join(","),
    ...rows.map((u) =>
      [
        JSON.stringify(u.displayName ?? ""),
        JSON.stringify(u.email),
        u.status,
        u.createdAt,
        u.lastLoginAt ?? "",
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "users.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface UserRow {
  id: string;
  email: string;
  displayName: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
}

type SortKey = "name" | "status" | "createdAt" | "lastLoginAt";

export default function UsersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState<Paginated<UserRow>["pagination"] | null>(null);
  const [q, setQ] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (submittedQ) params.set("q", submittedQ);
      params.set("page", String(page));
      const res = await api<Paginated<UserRow>>(`/v1/admin/users?${params}`);
      setRows(res.items);
      setMeta(res.pagination);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [submittedQ, page]);

  useEffect(() => {
    load();
  }, [load]);

  const { sorted, sort, toggle } = useTableSort<UserRow, SortKey>(rows, {
    name: (u) => (u.displayName ?? u.email).toLowerCase(),
    status: (u) => u.status,
    createdAt: (u) => new Date(u.createdAt).getTime(),
    lastLoginAt: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : null),
  });

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Browse members and open a full activity profile."
      />

      <Card>
        <form
          className="flex items-center gap-2 border-b p-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSubmittedQ(q);
          }}
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportUsersCSV(sorted)}
            disabled={sorted.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHead sortKey="name" sort={sort} onSort={toggle}>
                Member
              </SortableHead>
              <SortableHead sortKey="status" sort={sort} onSort={toggle}>
                Status
              </SortableHead>
              <SortableHead sortKey="createdAt" sort={sort} onSort={toggle}>
                Joined
              </SortableHead>
              <SortableHead sortKey="lastLoginAt" sort={sort} onSort={toggle}>
                Last login
              </SortableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={UsersIcon}
                    title="No users found"
                    description={
                      submittedQ
                        ? `No members match “${submittedQ}”.`
                        : "Members will appear here as they join."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((u) => (
                <TableRow
                  key={u.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/users/detail?id=${u.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {initials(u.displayName ?? u.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {u.displayName ?? (
                            <span className="text-muted-foreground">Unnamed</span>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {relativeTime(u.lastLoginAt)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination meta={meta} itemLabel="users" onPageChange={setPage} />
      </Card>
    </>
  );
}
