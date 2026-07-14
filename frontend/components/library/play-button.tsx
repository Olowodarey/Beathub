"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types";

interface PlayButtonProps {
  track?: ContentItem;
  queue?: ContentItem[];
  startIndex?: number;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "icon" | "lg";
  className?: string;
  label?: string;
}

/**
 * Play a single track or a queue via the global player.
 * If the same track is already the current track, this toggles play/pause.
 */
export function PlayButton({
  track,
  queue,
  startIndex = 0,
  variant = "solid",
  size = "icon",
  className,
  label,
}: PlayButtonProps) {
  const player = usePlayer();

  const primary = track ?? queue?.[startIndex];
  const isCurrent =
    primary && player.currentTrack?.id === primary.id;
  const isCurrentPlaying = isCurrent && player.isPlaying;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) {
      player.toggle();
      return;
    }
    if (queue && queue.length > 0) {
      player.playQueue(queue, startIndex);
    } else if (track) {
      player.playSingle(track);
    }
  };

  const icon = isCurrentPlaying ? (
    <Pause className="h-4 w-4" />
  ) : (
    <Play className="h-4 w-4" />
  );

  if (size === "lg") {
    return (
      <Button
        onClick={handleClick}
        className={cn("h-11 gap-2 rounded-full px-6 font-semibold", className)}
      >
        {icon}
        {label ?? (isCurrentPlaying ? "Pause" : "Play")}
      </Button>
    );
  }

  if (size === "sm") {
    return (
      <Button
        onClick={handleClick}
        variant={variant === "solid" ? "default" : variant}
        size="sm"
        className={cn("gap-2", className)}
      >
        {icon}
        {label ?? (isCurrentPlaying ? "Pause" : "Play")}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      size="icon"
      variant={variant === "solid" ? "default" : variant}
      className={cn(
        variant === "solid" && "rounded-full",
        "h-9 w-9 shrink-0",
        className,
      )}
      aria-label={isCurrentPlaying ? "Pause" : "Play"}
    >
      {icon}
    </Button>
  );
}
