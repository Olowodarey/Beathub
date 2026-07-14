"use client";

import { useEffect, useState } from "react";
import { ListPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApiClient } from "@/lib/api-client";
import type { PlaylistSummary } from "@/types";

export function AddToPlaylistButton({
  contentId,
  size = "icon",
}: {
  contentId: string;
  size?: "icon" | "sm";
}) {
  const api = useApiClient();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<PlaylistSummary[]>("/me/playlists")
      .then((r) => !cancelled && setPlaylists(r))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [api, open]);

  const addTo = async (playlistId: string) => {
    setBusyId(playlistId);
    try {
      await api.post(`/playlists/${playlistId}/tracks`, { contentId });
      toast.success("Added to playlist");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add track");
    } finally {
      setBusyId(null);
    }
  };

  const createAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const created = await api.post<{ id: string; name: string }>(
        "/me/playlists",
        { name },
      );
      await api.post(`/playlists/${created.id}/tracks`, { contentId });
      toast.success(`Added to ${created.name}`);
      setNewName("");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {size === "sm" ? (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <ListPlus className="mr-2 h-4 w-4" />
          Add to playlist
        </Button>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          aria-label="Add to playlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          className="h-8 w-8 shrink-0"
        >
          <ListPlus className="h-4 w-4" />
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to playlist</DialogTitle>
            <DialogDescription>
              Pick one of yours or create a new playlist for this track.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : playlists.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any playlists yet.
              </p>
            ) : (
              playlists.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addTo(p.id)}
                  disabled={busyId === p.id}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
                >
                  <span className="truncate">
                    {p.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      · {p.trackCount} tracks
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.role === "owner" ? "yours" : "shared"}
                  </span>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <form
              onSubmit={createAndAdd}
              className="flex w-full items-center gap-2"
            >
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Or create a new playlist…"
                maxLength={120}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={creating || !newName.trim()}>
                <Plus className="mr-1 h-4 w-4" />
                {creating ? "Creating…" : "Create"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
