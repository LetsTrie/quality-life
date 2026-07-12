"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { getToken } from "@/lib/admin-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return <DashboardShell>{children}</DashboardShell>;
}
