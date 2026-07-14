"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ListMusic, Music2, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { AddToPlaylistButton } from "@/components/library/add-to-playlist-button";
import { PlayButton } from "@/components/library/play-button";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApiClient } from "@/lib/api-client";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";
import type { PendingInviteRow, PlaylistDetail } from "@/types";

function heroGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const h1 = hash % 360;
  const h2 = (h1 + 60 + (hash % 90)) % 360;
  return `linear-gradient(135deg, oklch(0.55 0.22 ${h1}), oklch(0.4 0.2 ${h2}))`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApiClient();
  const player = usePlayer();

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingEntry, setRemovingEntry] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [revokingInvite, setRevokingInvite] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const playlistId = params?.id;

  const load = useCallback(async () => {
    if (!playlistId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<PlaylistDetail>(`/playlists/${playlistId}`);
      setPlaylist(data);
      if (data.viewerRole === "owner") {
        const invites = await api.get<PendingInviteRow[]>(
          `/playlists/${playlistId}/invites`,
        );
        setPendingInvites(invites);
      } else {
        setPendingInvites([]);
      }
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [api, playlistId]);

  useEffect(() => {
    void load();
  }, [load]);

  const trackQueue = useMemo(
    () => playlist?.tracks.map((t) => t.track) ?? [],
    [playlist],
  );

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistId || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.post(`/playlists/${playlistId}/invites`, {
        email: inviteEmail.trim(),
      });
      setInviteEmail("");
      toast.success("Invite sent — they'll see it in their Playlists");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't invite");
    } finally {
      setInviting(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    if (!playlistId) return;
    setRevokingInvite(inviteId);
    try {
      await api.delete(`/playlists/${playlistId}/invites/${inviteId}`);
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't revoke invite",
      );
    } finally {
      setRevokingInvite(null);
    }
  };

  const removeTrack = async (entryId: string) => {
    if (!playlistId) return;
    setRemovingEntry(entryId);
    try {
      await api.delete(`/playlists/${playlistId}/tracks/${entryId}`);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              tracks: prev.tracks.filter((t) => t.entryId !== entryId),
            }
          : prev,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove track");
    } finally {
      setRemovingEntry(null);
    }
  };

  const removeMember = async (memberUserId: string) => {
    if (!playlistId) return;
    setRemovingMember(memberUserId);
    try {
      await api.delete(`/playlists/${playlistId}/members/${memberUserId}`);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.filter((m) => m.userId !== memberUserId),
            }
          : prev,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove member");
    } finally {
      setRemovingMember(null);
    }
  };

  const removePlaylist = async () => {
    if (!playlistId) return;
    const ok = window.confirm(
      "Delete this playlist? Members will lose access immediately.",
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await api.delete(`/playlists/${playlistId}`);
      toast.success("Playlist deleted");
      router.push("/dashboard/playlists");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete");
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading playlist…</p>;
  }
  if (error || !playlist) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load playlist: {error?.message ?? "not found"}
      </p>
    );
  }

  const isOwner = playlist.viewerRole === "owner";
  const peopleCount = playlist.members.length + 1;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Hero */}
      <div
        className="relative flex flex-col gap-4 overflow-hidden rounded-2xl p-6 text-white sm:flex-row sm:items-end sm:gap-6 sm:p-8"
        style={{ background: heroGradient(playlist.id) }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-black/25 blur-3xl"
          aria-hidden
        />
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-lg backdrop-blur-sm sm:h-40 sm:w-40">
          <ListMusic className="h-14 w-14 text-white/95 drop-shadow" />
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-white/80">
            Playlist
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {playlist.name}
          </h1>
          <p className="text-sm text-white/90">
            by <span className="font-medium">{playlist.ownerName}</span>
            {" · "}
            {playlist.tracks.length}{" "}
            {playlist.tracks.length === 1 ? "track" : "tracks"}
            {" · "}
            {peopleCount} {peopleCount === 1 ? "person" : "people"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {trackQueue.length > 0 ? (
              <PlayButton
                queue={trackQueue}
                startIndex={0}
                size="lg"
                label="Play all"
                className="bg-white text-neutral-900 hover:bg-white/90"
              />
            ) : null}
            {isOwner ? (
              <Button
                variant="outline"
                size="sm"
                onClick={removePlaylist}
                disabled={deleting}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          {playlist.tracks.length === 0 ? (
            <EmptyState
              icon={Music2}
              title="No tracks yet"
              description="Add tracks from your Library. Anyone in the playlist can add tracks."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="grid grid-cols-[40px_1fr_auto] gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="text-center">#</span>
                <span>Track</span>
                <span></span>
              </div>
              {playlist.tracks.map((entry, i) => {
                const isCurrent =
                  player.currentTrack?.id === entry.track.id;
                return (
                  <div
                    key={entry.entryId}
                    className={cn(
                      "group grid grid-cols-[40px_1fr_auto] items-center gap-3 border-b px-4 py-3 last:border-b-0 transition-colors hover:bg-muted/50",
                      isCurrent && "bg-brand/15",
                    )}
                  >
                    <div className="relative flex items-center justify-center text-sm tabular-nums text-muted-foreground">
                      <span className="group-hover:hidden">{i + 1}</span>
                      <div className="hidden group-hover:block">
                        <PlayButton
                          track={entry.track}
                          queue={trackQueue}
                          startIndex={i}
                          variant="ghost"
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          isCurrent && "text-brand",
                        )}
                      >
                        {entry.track.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {entry.track.uploaderName} · added by{" "}
                        {entry.addedByName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <AddToPlaylistButton contentId={entry.track.id} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove from playlist"
                        onClick={() => removeTrack(entry.entryId)}
                        disabled={removingEntry === entry.entryId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                People
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <PersonRow
                name={playlist.ownerName}
                subtitle={`${playlist.ownerEmail} · owner`}
                accent
              />
              {playlist.members.map((m) => (
                <PersonRow
                  key={m.id}
                  name={m.name}
                  subtitle={m.email}
                  onRemove={
                    isOwner ? () => removeMember(m.userId) : undefined
                  }
                  removing={removingMember === m.userId}
                />
              ))}
              {isOwner && pendingInvites.length > 0 ? (
                <div className="space-y-2 border-t pt-2">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Pending invites
                  </div>
                  {pendingInvites.map((inv) => (
                    <PersonRow
                      key={inv.id}
                      name={inv.name}
                      subtitle={`${inv.email} · awaiting response`}
                      dashed
                      onRemove={() => revokeInvite(inv.id)}
                      removing={revokingInvite === inv.id}
                    />
                  ))}
                </div>
              ) : null}
              {isOwner ? (
                <form onSubmit={invite} className="space-y-2 pt-2">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@gmail.com"
                    className="text-xs"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    disabled={inviting || !inviteEmail.trim()}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {inviting ? "Adding…" : "Invite friend"}
                  </Button>
                  <p className="text-[10px] text-muted-foreground">
                    They need to have signed in to Beathub at least once.
                  </p>
                </form>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function PersonRow({
  name,
  subtitle,
  accent,
  dashed,
  onRemove,
  removing,
}: {
  name: string;
  subtitle: string;
  accent?: boolean;
  dashed?: boolean;
  onRemove?: () => void;
  removing?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border p-2 text-xs",
        accent && "bg-muted/30",
        dashed && "border-dashed",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[10px] font-semibold text-brand">
          {initials(name)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium">{name}</div>
          <div className="truncate text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      {onRemove ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          aria-label="Remove"
          onClick={onRemove}
          disabled={removing}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      ) : null}
    </div>
  );
}
