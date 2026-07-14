"use client";

import { useCallback, useEffect, useState } from "react";
import { Headphones } from "lucide-react";
import { AddToPlaylistButton } from "@/components/library/add-to-playlist-button";
import { AudioPlayer } from "@/components/library/audio-player";
import { EmptyState } from "@/components/empty-state";
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
import type { ContentItem } from "@/types";

export default function LibraryPage() {
  const { activeTeamId } = useCurrentUser();
  const api = useApiClient();
  const [tracks, setTracks] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeTeamId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<ContentItem[]>(`/teams/${activeTeamId}/library`)
      .then((r) => !cancelled && setTracks(r))
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeTeamId, api]);

  const handlePlayed = useCallback((updated: ContentItem) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every approved track on your team. Each play counts toward creator
          earnings.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading library…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load library: {error.message}
        </p>
      ) : tracks.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="No approved tracks yet"
          description="Once a track is uploaded and approved by an admin, it shows up here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[26%]">Track</TableHead>
                <TableHead className="w-[16%]">Artist</TableHead>
                <TableHead className="w-[10%]">Genre</TableHead>
                <TableHead className="w-[10%] text-right">Plays</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track) => (
                <TableRow key={track.id}>
                  <TableCell className="text-sm font-medium">
                    {track.title}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {track.uploaderName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {track.genre}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {track.playCount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <AudioPlayer track={track} onPlayed={handlePlayed} />
                  </TableCell>
                  <TableCell className="text-right">
                    <AddToPlaylistButton contentId={track.id} />
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
