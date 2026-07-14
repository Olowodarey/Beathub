"use client";

import { useCallback, useEffect, useState } from "react";
import { ModerationQueue } from "@/components/content/moderation-queue";
import { UploadTrackForm } from "@/components/content/upload-track-form";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/current-user";
import { formatDate } from "@/lib/format";
import type { ContentItem } from "@/types";

export default function ContentPage() {
  const { currentUser, activeTeamId } = useCurrentUser();
  const api = useApiClient();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const canModerate =
    currentUser?.membership.role === "OWNER" ||
    currentUser?.membership.role === "ADMIN";

  useEffect(() => {
    if (!activeTeamId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<ContentItem[]>(`/teams/${activeTeamId}/content`)
      .then((r) => !cancelled && setItems(r))
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeTeamId, api]);

  const handleDecide = useCallback(
    async (id: string, next: "APPROVED" | "REJECTED") => {
      const updated = await api.patch<ContentItem>(`/content/${id}/status`, {
        status: next,
      });
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    },
    [api],
  );

  const handleUploaded = useCallback((item: ContentItem) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  if (!currentUser || !activeTeamId) return null;

  const myUploads = items.filter(
    (it) => it.uploaderId === currentUser.user.id,
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {canModerate ? "Content" : "Your tracks"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canModerate
            ? "Upload new material and review incoming submissions."
            : "Upload new tracks and see where each one is in review."}
        </p>
      </div>

      <UploadTrackForm teamId={activeTeamId} onUploaded={handleUploaded} />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load content: {error.message}
        </p>
      ) : canModerate ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Moderation queue</h2>
          <ModerationQueue items={items} onDecide={handleDecide} />
        </section>
      ) : (
        <UploaderTable items={myUploads} />
      )}
    </div>
  );
}

function UploaderTable({ items }: { items: ContentItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No uploads yet. Your first track will appear here.
      </p>
    );
  }
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Uploaded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-sm font-medium">
                {item.title}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.genre}
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {formatDate(item.uploadedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
