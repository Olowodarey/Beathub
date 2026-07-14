"use client";

import { Music2 } from "lucide-react";
import { AddToPlaylistButton } from "@/components/library/add-to-playlist-button";
import { AudioPlayer } from "@/components/library/audio-player";
import { Card, CardContent } from "@/components/ui/card";
import type { ContentItem } from "@/types";

// Deterministic pastel gradient per track so covers feel distinct without art.
function coverGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const h1 = hash % 360;
  const h2 = (h1 + 40 + (hash % 60)) % 360;
  return `linear-gradient(135deg, oklch(0.68 0.16 ${h1}), oklch(0.55 0.18 ${h2}))`;
}

export function TrackCard({
  track,
  onPlayed,
}: {
  track: ContentItem;
  onPlayed: (updated: ContentItem) => void;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div
        className="relative flex aspect-square w-full items-center justify-center text-white/90"
        style={{ background: coverGradient(track.id) }}
        aria-hidden
      >
        <Music2 className="h-10 w-10 drop-shadow" />
        <span className="absolute right-2 top-2 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide backdrop-blur-sm">
          {track.genre}
        </span>
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{track.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {track.uploaderName} · {track.playCount.toLocaleString()} plays
            </p>
          </div>
          <AddToPlaylistButton contentId={track.id} />
        </div>
        <AudioPlayer track={track} onPlayed={onPlayed} />
      </CardContent>
    </Card>
  );
}
