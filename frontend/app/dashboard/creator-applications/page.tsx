"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
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
import type { CreatorApplication, CreatorApplicationRow } from "@/types";

export default function CreatorApplicationsPage() {
  const { currentUser, activeTeamId } = useCurrentUser();
  const api = useApiClient();
  const [items, setItems] = useState<CreatorApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const canReview =
    currentUser?.membership.role === "OWNER" ||
    currentUser?.membership.role === "ADMIN";

  useEffect(() => {
    if (!activeTeamId || !canReview) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<CreatorApplicationRow[]>(
        `/teams/${activeTeamId}/creator-applications`,
      )
      .then((r) => !cancelled && setItems(r))
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeTeamId, api, canReview]);

  const decide = useCallback(
    async (id: string, status: "APPROVED" | "REJECTED") => {
      if (!activeTeamId) return;
      setBusyId(id);
      try {
        const updated = await api.post<CreatorApplication>(
          `/teams/${activeTeamId}/creator-applications/${id}/decision`,
          { status },
        );
        setItems((prev) =>
          prev.map((row) => (row.id === id ? { ...row, ...updated } : row)),
        );
        toast.success(
          status === "APPROVED"
            ? "Application approved — user is now a creator"
            : "Application rejected",
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Couldn't record decision",
        );
      } finally {
        setBusyId(null);
      }
    },
    [activeTeamId, api],
  );

  if (!canReview) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          icon={ShieldAlert}
          title="Reviewing applications is admin-only"
          description="Ask an owner or admin for access if you need to review creator applications."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Creator applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve or reject listener requests to become creators.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading applications…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load applications: {error.message}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No applications yet.
        </p>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="flex flex-col gap-3 sm:hidden">
            {items.map((row) => (
              <Card key={row.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {row.applicantName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.applicantEmail}
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <p className="text-sm text-muted-foreground break-words">
                  {row.message ?? (
                    <span className="italic">No message</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDate(row.createdAt)}
                </p>
                {row.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => decide(row.id, "REJECTED")}
                      disabled={busyId === row.id}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => decide(row.id, "APPROVED")}
                      disabled={busyId === row.id}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Decided {row.decidedAt ? formatDate(row.decidedAt) : ""}
                  </p>
                )}
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden overflow-hidden p-0 sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm">
                      <div className="font-medium">{row.applicantName}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.applicantEmail}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      {row.message ?? (
                        <span className="italic">No message</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => decide(row.id, "REJECTED")}
                            disabled={busyId === row.id}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => decide(row.id, "APPROVED")}
                            disabled={busyId === row.id}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Decided {row.decidedAt ? formatDate(row.decidedAt) : ""}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
