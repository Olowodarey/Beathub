"use client";

import { Music2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

function coverGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const h1 = hash % 360;
  const h2 = (h1 + 40 + (hash % 60)) % 360;
  return `linear-gradient(135deg, oklch(0.68 0.16 ${h1}), oklch(0.55 0.18 ${h2}))`;
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrack,
    currentIndex,
    queue,
    isPlaying,
    currentTime,
    duration,
    toggle,
    next,
    prev,
    seek,
  } = usePlayer();

  if (!currentTrack) return null;

  const total = duration || currentTrack.durationSeconds || 30;
  const percent = Math.min(100, (currentTime / total) * 100);
  const hasNext = currentIndex !== null && currentIndex + 1 < queue.length;
  const hasPrev = currentIndex !== null && currentIndex > 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    seek(ratio * total);
  };

  return (
    <div className="sticky bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-white/90 sm:h-12 sm:w-12"
              style={{ background: coverGradient(currentTrack.id) }}
              aria-hidden
            >
              <Music2 className="h-5 w-5 drop-shadow" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {currentTrack.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {currentTrack.uploaderName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:hidden">
            <Button
              size="icon"
              variant="ghost"
              onClick={prev}
              disabled={!hasPrev}
              aria-label="Previous"
              className="h-10 w-10"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="h-11 w-11 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={next}
              disabled={!hasNext}
              aria-label="Next"
              className="h-10 w-10"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 sm:flex-1">
          <div className="hidden items-center gap-1 sm:flex">
            <Button
              size="icon"
              variant="ghost"
              onClick={prev}
              disabled={!hasPrev}
              aria-label="Previous"
              className="h-8 w-8"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="h-9 w-9 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={next}
              disabled={!hasNext}
              aria-label="Next"
              className="h-8 w-8"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex w-full items-center gap-2 text-[10px] tabular-nums text-muted-foreground sm:max-w-md">
            <span className="hidden sm:inline">{fmt(currentTime)}</span>
            <div
              className="group flex h-6 flex-1 cursor-pointer items-center sm:h-3"
              onClick={handleSeek}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={currentTime}
              tabIndex={0}
            >
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted-foreground/30">
                <div
                  className={cn(
                    "h-full bg-brand transition-[width] duration-100",
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <span className="hidden sm:inline">{fmt(total)}</span>
          </div>
        </div>

        <div className="hidden w-16 shrink-0 items-center justify-end gap-1 text-xs text-muted-foreground lg:flex">
          {queue.length > 1 && currentIndex !== null ? (
            <span>
              {currentIndex + 1} / {queue.length}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
