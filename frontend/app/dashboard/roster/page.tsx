"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, ShieldAlert, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { formatCompactNumber, formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LabelOutgoingInvite, RosterArtist } from "@/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function RosterPage() {
  const { currentUser } = useCurrentUser();
  const api = useApiClient();
  const [roster, setRoster] = useState<RosterArtist[]>([]);
  const [invites, setInvites] = useState<LabelOutgoingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const isLabel =
    currentUser?.membership.role === "MEMBER" &&
    currentUser.membership.personaType === "LABEL_REP";

  const load = useCallback(async () => {
    if (!isLabel) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [r, i] = await Promise.all([
        api.get<RosterArtist[]>("/me/label/roster"),
        api.get<LabelOutgoingInvite[]>("/me/label/invites"),
      ]);
      setRoster(r);
      setInvites(i);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [api, isLabel]);

  useEffect(() => {
    void load();
  }, [load]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.post("/me/label/invites", { email: inviteEmail.trim() });
      setInviteEmail("");
      toast.success("Invite sent — they'll get it in their dashboard");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't invite");
    } finally {
      setInviting(false);
    }
  };

  const revokeInvite = async (id: string) => {
    setBusy(id);
    try {
      await api.delete(`/me/label/invites/${id}`);
      setInvites((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't revoke invite",
      );
    } finally {
      setBusy(null);
    }
  };

  const remove = async (artistId: string, name: string) => {
    const ok = window.confirm(
      `Remove ${name} from your roster? They'll keep their tracks but no longer be signed to your label.`,
    );
    if (!ok) return;
    setBusy(artistId);
    try {
      await api.delete(`/me/label/roster/${artistId}`);
      setRoster((prev) => prev.filter((a) => a.id !== artistId));
      toast.success("Artist removed from roster");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove");
    } finally {
      setBusy(null);
    }
  };

  if (currentUser && !isLabel) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          icon={ShieldAlert}
          title="Roster is for label owners"
          description="Apply to become a label from Settings to build a roster."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roster</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite creators by email. They see the invite in their dashboard and
          decide.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={invite} className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="artist@gmail.com"
              className="flex-1"
            />
            <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
              <UserPlus className="mr-2 h-4 w-4" />
              {inviting ? "Sending…" : "Invite artist"}
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            The artist must have a Beathub account and be a creator. They can
            only be signed to one label at a time.
          </p>
        </CardContent>
      </Card>

      {invites.length > 0 ? (
        <section
          className={cn(
            "space-y-3 rounded-md border border-brand/40 bg-brand/10 p-4",
          )}
        >
          <h2 className="text-sm font-semibold">
            Pending invites ({invites.length})
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-2 rounded-md border bg-card p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {inv.artistName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {inv.artistEmail} · invited {formatDate(inv.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Revoke"
                  onClick={() => revokeInvite(inv.id)}
                  disabled={busy === inv.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading roster…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load roster: {error.message}
        </p>
      ) : roster.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No artists yet"
          description="Send an invite above. Once they accept, they show up here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artist</TableHead>
                <TableHead className="w-[15%]">Tracks</TableHead>
                <TableHead className="w-[15%] text-right">Plays</TableHead>
                <TableHead className="w-[15%] text-right">Earnings</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand">
                        {initials(a.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {a.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {a.approvedTrackCount}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatCompactNumber(a.totalPlays)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-brand">
                    {formatCurrency(a.earningsUsd)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Remove from roster"
                      onClick={() => remove(a.id, a.name)}
                      disabled={busy === a.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
