"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/lib/api-client";
import type { ContentItem } from "@/types";

const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

export function AudioPlayer({
  track,
  onPlayed,
}: {
  track: ContentItem;
  onPlayed: (updated: ContentItem) => void;
}) {
  const api = useApiClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playRecordedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    playRecordedRef.current = false;
    setCurrent(0);
  }, [track.id]);

  const src = track.audioUrl ? `${BASE}${track.audioUrl}` : null;

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      await el.play();
    } else {
      el.pause();
    }
  };

  const handlePlay = () => setPlaying(true);
  const handlePause = () => setPlaying(false);
  const handleTimeUpdate = async () => {
    const el = audioRef.current;
    if (!el) return;
    setCurrent(el.currentTime);
    // Record a play once the listener has heard at least 10s (or 30% of a short track).
    if (
      !playRecordedRef.current &&
      el.currentTime >= Math.min(10, track.durationSeconds * 0.3)
    ) {
      playRecordedRef.current = true;
      try {
        const updated = await api.post<ContentItem>(
          `/content/${track.id}/play`,
        );
        onPlayed(updated);
      } catch {
        // Don't disrupt playback on a play-count failure.
      }
    }
  };

  const percent = track.durationSeconds
    ? Math.min(100, (current / track.durationSeconds) * 100)
    : 0;

  if (!src) {
    return (
      <span className="text-xs text-muted-foreground">
        Audio unavailable
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handlePause}
        onTimeUpdate={handleTimeUpdate}
      />
      <Button
        size="icon"
        variant="outline"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="h-9 w-9 shrink-0"
      >
        {playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-brand transition-[width] duration-100"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatTime(current)} / {formatTime(track.durationSeconds)}
        </span>
      </div>
    </div>
  );
}

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
