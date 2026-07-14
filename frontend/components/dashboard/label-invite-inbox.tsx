"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/lib/api-client";
import type { LabelIncomingInvite } from "@/types";

export function LabelInviteInbox() {
  const api = useApiClient();
  const [invites, setInvites] = useState<LabelIncomingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<LabelIncomingInvite[]>("/me/label-invites")
      .then((r) => !cancelled && setInvites(r))
      .catch(() => !cancelled && setInvites([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [api]);

  const respond = useCallback(
    async (id: string, action: "accept" | "decline") => {
      setBusy(id);
      try {
        await api.post(`/me/label-invites/${id}/${action}`);
        setInvites((prev) => prev.filter((i) => i.id !== id));
        toast.success(
          action === "accept"
            ? "Joined the label — check your dashboard again"
            : "Invite declined",
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't respond");
      } finally {
        setBusy(null);
      }
    },
    [api],
  );

  if (loading || invites.length === 0) return null;

  return (
    <section className="space-y-3 rounded-md border border-brand/40 bg-brand/10 p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Briefcase className="h-4 w-4 text-brand" />
        You have {invites.length} label invite{invites.length === 1 ? "" : "s"}
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {invites.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between gap-3 rounded-md border bg-card p-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{inv.labelName}</p>
              <p className="truncate text-xs text-muted-foreground">
                wants to sign you to their label
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => respond(inv.id, "decline")}
                disabled={busy === inv.id}
              >
                <X className="mr-1 h-4 w-4" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => respond(inv.id, "accept")}
                disabled={busy === inv.id}
              >
                <Check className="mr-1 h-4 w-4" />
                Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
