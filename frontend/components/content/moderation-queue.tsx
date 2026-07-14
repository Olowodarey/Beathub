"use client";

import { useMemo, useState } from "react";
import { Check, Filter, Music2, Podcast, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { formatDuration, formatRelativeTime } from "@/lib/format";
import type { ContentItem, ContentStatus } from "@/types";

type StatusFilter = "ALL" | ContentStatus;

export function ModerationQueue({
  items,
  onDecide,
}: {
  items: ContentItem[];
  onDecide: (id: string, next: "APPROVED" | "REJECTED") => Promise<void>;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      statusFilter === "ALL"
        ? items
        : items.filter((item) => item.status === statusFilter),
    [items, statusFilter],
  );

  const decide = async (id: string, next: "APPROVED" | "REJECTED") => {
    setBusyId(id);
    try {
      await onDecide(id, next);
      toast.success(
        next === "APPROVED" ? "Content approved" : "Content rejected",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-3.5 w-3.5" aria-hidden />
          Showing{" "}
          <span className="font-medium text-foreground">{filtered.length}</span>
          {" "}of{" "}
          <span className="font-medium text-foreground">{items.length}</span>{" "}
          uploads
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Music2}
              title="No uploads to review"
              description="The moderation queue is clear. Nice work."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead className="hidden md:table-cell">Genre</TableHead>
                <TableHead className="hidden md:table-cell">Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {item.kind === "TRACK" ? (
                          <Music2 className="h-4 w-4" aria-hidden />
                        ) : (
                          <Podcast className="h-4 w-4" aria-hidden />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.kind === "TRACK" ? "Track" : "Podcast"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{item.uploaderName}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {item.genre}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {formatDuration(item.durationSeconds)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell
                    className="text-sm text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {formatRelativeTime(item.uploadedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === item.id}
                          onClick={() => decide(item.id, "REJECTED")}
                        >
                          <X aria-hidden />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          disabled={busyId === item.id}
                          onClick={() => decide(item.id, "APPROVED")}
                        >
                          <Check aria-hidden />
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}
