"use client";

import { useEffect, useState } from "react";
import { Headphones } from "lucide-react";
import { AddToPlaylistButton } from "@/components/library/add-to-playlist-button";
import { PlayButton } from "@/components/library/play-button";
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
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types";

export default function LibraryPage() {
  const { activeTeamId } = useCurrentUser();
  const api = useApiClient();
  const player = usePlayer();
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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every approved track on your team. Each play counts toward creator
            earnings.
          </p>
        </div>
        {tracks.length > 0 ? (
          <PlayButton queue={tracks} startIndex={0} size="sm" label="Play all" />
        ) : null}
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
                <TableHead className="w-[52px]"></TableHead>
                <TableHead>Track</TableHead>
                <TableHead className="w-[20%]">Artist</TableHead>
                <TableHead className="w-[12%]">Genre</TableHead>
                <TableHead className="w-[10%] text-right">Plays</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track, i) => {
                const isCurrent = player.currentTrack?.id === track.id;
                return (
                  <TableRow
                    key={track.id}
                    className={cn(isCurrent && "bg-brand/15")}
                  >
                    <TableCell>
                      <PlayButton
                        track={track}
                        queue={tracks}
                        startIndex={i}
                        variant="ghost"
                      />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-sm font-medium",
                        isCurrent && "text-brand",
                      )}
                    >
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
                    <TableCell className="text-right">
                      <AddToPlaylistButton contentId={track.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
