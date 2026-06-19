import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Paginated } from "@/lib/api";

export function Pagination({
  meta,
  onPageChange,
  itemLabel = "items",
}: {
  meta: Paginated<unknown>["pagination"] | null;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}) {
  if (!meta || meta.total === 0) return null;
  const { page, pageSize, total } = meta;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="px-1 text-sm tabular-nums text-muted-foreground">
          Page {page}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasMore}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
