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
import type { LabelApplication, LabelApplicationRow } from "@/types";

export default function LabelApplicationsPage() {
  const { currentUser, activeTeamId } = useCurrentUser();
  const api = useApiClient();
  const [items, setItems] = useState<LabelApplicationRow[]>([]);
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
      .get<LabelApplicationRow[]>(
        `/teams/${activeTeamId}/label-applications`,
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
        const updated = await api.post<LabelApplication>(
          `/teams/${activeTeamId}/label-applications/${id}/decision`,
          { status },
        );
        setItems((prev) =>
          prev.map((row) => (row.id === id ? { ...row, ...updated } : row)),
        );
        toast.success(
          status === "APPROVED"
            ? "Application approved — user is now a label owner"
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
          description="Ask an owner or admin for access."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Label applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve or reject requests from users who want to run their own label.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading applications…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load applications: {error.message}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet.</p>
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Proposed label</TableHead>
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
                  <TableCell className="text-sm">
                    {row.labelName ?? (
                      <span className="italic text-muted-foreground">
                        Not provided
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    {row.message ?? <span className="italic">No message</span>}
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
                        Decided{" "}
                        {row.decidedAt ? formatDate(row.decidedAt) : ""}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
