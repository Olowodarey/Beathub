"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, ListMusic, Music2, Plus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApiClient } from "@/lib/api-client";
import type { MyPlaylistInvite, PlaylistSummary } from "@/types";

export default function PlaylistsPage() {
  const api = useApiClient();
  const [items, setItems] = useState<PlaylistSummary[]>([]);
  const [invites, setInvites] = useState<MyPlaylistInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyInvite, setBusyInvite] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, invitesRows] = await Promise.all([
        api.get<PlaylistSummary[]>("/me/playlists"),
        api.get<MyPlaylistInvite[]>("/me/playlist-invites"),
      ]);
      setItems(rows);
      setInvites(invitesRows);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const respondToInvite = async (
    inviteId: string,
    action: "accept" | "decline",
  ) => {
    setBusyInvite(inviteId);
    try {
      await api.post(`/me/playlist-invites/${inviteId}/${action}`);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      if (action === "accept") {
        toast.success("Joined playlist");
        await load();
      } else {
        toast.success("Invite declined");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't respond to invite",
      );
    } finally {
      setBusyInvite(null);
    }
  };

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await api.post("/me/playlists", { name });
      setNewName("");
      toast.success("Playlist created");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't create playlist",
      );
    } finally {
      setCreating(false);
    }
  };

  const owned = items.filter((p) => p.role === "owner");
  const shared = items.filter((p) => p.role === "member");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Playlists</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Curate what you love. Share with friends by adding them by email — only
          people you invite will see the playlist.
        </p>
      </div>

      {invites.length > 0 ? (
        <section className="space-y-3 rounded-md border border-brand/30 bg-brand/5 p-4">
          <h2 className="text-sm font-semibold">
            You have {invites.length} playlist{invites.length === 1 ? "" : "s"} to accept
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-start justify-between gap-3 rounded-md border bg-card p-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{inv.playlistName}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    invited by {inv.invitedByName} · {inv.trackCount} tracks
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respondToInvite(inv.id, "decline")}
                    disabled={busyInvite === inv.id}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => respondToInvite(inv.id, "accept")}
                    disabled={busyInvite === inv.id}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New playlist name — e.g. Late night drives"
              maxLength={120}
              className="flex-1"
            />
            <Button type="submit" disabled={creating || !newName.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              {creating ? "Creating…" : "Create playlist"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading playlists…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load playlists: {error.message}
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No playlists yet"
          description="Create one above and start adding tracks from your Library."
        />
      ) : (
        <>
          <Section title="Your playlists" items={owned} />
          <Section title="Shared with you" items={shared} />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: PlaylistSummary[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/playlists/${p.id}`}
            className="group"
          >
            <Card className="h-full transition-colors group-hover:border-brand/60">
              <CardContent className="space-y-3 p-4">
                <div className="flex h-24 items-center justify-center rounded-md bg-gradient-to-br from-brand/20 to-brand/5">
                  <ListMusic className="h-8 w-8 text-brand" />
                </div>
                <div>
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    by {p.ownerName}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Music2 className="h-3 w-3" />
                    {p.trackCount} {p.trackCount === 1 ? "track" : "tracks"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {p.memberCount + 1}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
