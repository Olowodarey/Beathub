"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Music2, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { AudioPlayer } from "@/components/library/audio-player";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApiClient } from "@/lib/api-client";
import type { ContentItem, PlaylistDetail } from "@/types";

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApiClient();
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingEntry, setRemovingEntry] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const playlistId = params?.id;

  const load = useCallback(async () => {
    if (!playlistId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<PlaylistDetail>(`/playlists/${playlistId}`);
      setPlaylist(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [api, playlistId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onPlayed = useCallback((updated: ContentItem) => {
    setPlaylist((prev) =>
      prev
        ? {
            ...prev,
            tracks: prev.tracks.map((t) =>
              t.track.id === updated.id ? { ...t, track: updated } : t,
            ),
          }
        : prev,
    );
  }, []);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistId || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.post(`/playlists/${playlistId}/members`, {
        email: inviteEmail.trim(),
      });
      setInviteEmail("");
      toast.success("Friend invited");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't invite");
    } finally {
      setInviting(false);
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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {playlist.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isOwner
              ? `${playlist.tracks.length} tracks · ${playlist.members.length + 1} people`
              : `Shared by ${playlist.ownerName}`}
          </p>
        </div>
        {isOwner ? (
          <Button
            variant="outline"
            size="sm"
            onClick={removePlaylist}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Deleting…" : "Delete playlist"}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          {playlist.tracks.length === 0 ? (
            <EmptyState
              icon={Music2}
              title="No tracks yet"
              description="Add tracks from your Library. Anyone in the playlist can add tracks."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {playlist.tracks.map((entry) => (
                <div
                  key={entry.entryId}
                  className="flex items-center gap-3 rounded-md border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.track.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.track.uploaderName} · added by {entry.addedByName}
                    </p>
                  </div>
                  <div className="w-64 shrink-0">
                    <AudioPlayer track={entry.track} onPlayed={onPlayed} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Remove from playlist"
                    onClick={() => removeTrack(entry.entryId)}
                    disabled={removingEntry === entry.entryId}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
              <div className="rounded-md border bg-muted/30 p-2 text-xs">
                <div className="font-medium">{playlist.ownerName}</div>
                <div className="text-muted-foreground">
                  {playlist.ownerEmail} · owner
                </div>
              </div>
              {playlist.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start justify-between gap-2 rounded-md border p-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{m.name}</div>
                    <div className="truncate text-muted-foreground">
                      {m.email}
                    </div>
                  </div>
                  {isOwner ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label="Remove member"
                      onClick={() => removeMember(m.userId)}
                      disabled={removingMember === m.userId}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  ) : null}
                </div>
              ))}
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
                    {inviting ? "Adding…" : "Add friend"}
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
