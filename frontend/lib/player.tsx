"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api-client";
import type { ContentItem } from "@/types";

const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

interface PlayerState {
  queue: ContentItem[];
  currentIndex: number | null;
  currentTrack: ContentItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

interface PlayerContextValue extends PlayerState {
  playQueue: (tracks: ContentItem[], startIndex?: number) => void;
  playSingle: (track: ContentItem) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onTrackPlayed: (updated: ContentItem) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playCountedRef = useRef<Set<string>>(new Set());
  const api = useApiClient();
  const { isSignedIn } = useAuth();

  const [queue, setQueue] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack =
    currentIndex !== null && queue[currentIndex] ? queue[currentIndex] : null;

  const playQueue = useCallback(
    (tracks: ContentItem[], startIndex = 0) => {
      if (!tracks.length) return;
      setQueue(tracks);
      setCurrentIndex(Math.max(0, Math.min(startIndex, tracks.length - 1)));
      setIsPlaying(true);
    },
    [],
  );

  const playSingle = useCallback(
    (track: ContentItem) => {
      playQueue([track], 0);
    },
    [playQueue],
  );

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el || !currentTrack) return;
    if (el.paused) void el.play();
    else el.pause();
  }, [currentTrack]);

  const next = useCallback(() => {
    setCurrentIndex((idx) => {
      if (idx === null) return null;
      const nextIdx = idx + 1;
      if (nextIdx >= queue.length) return idx;
      return nextIdx;
    });
  }, [queue.length]);

  const prev = useCallback(() => {
    const el = audioRef.current;
    // If we're > 3s in, restart current instead of moving back
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      return;
    }
    setCurrentIndex((idx) => (idx === null || idx === 0 ? idx : idx - 1));
  }, []);

  const seek = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  // When the current track changes, load the new src and auto-play
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    const el = audioRef.current;
    const src = currentTrack.audioUrl ? `${BASE}${currentTrack.audioUrl}` : null;
    if (!src) return;
    el.src = src;
    el.load();
    void el.play().catch(() => {
      setIsPlaying(false);
    });
    setCurrentTime(0);
  }, [currentTrack]);

  // Optimistic play-count update from anywhere in the app
  const onTrackPlayed = useCallback((updated: ContentItem) => {
    setQueue((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  }, []);

  // Record a play after 10s (or 30% of duration for very short tracks)
  const recordPlayIfEligible = useCallback(async () => {
    const track = currentTrack;
    if (!track || !isSignedIn) return;
    if (playCountedRef.current.has(track.id)) return;
    const el = audioRef.current;
    if (!el) return;
    const threshold = Math.min(10, track.durationSeconds * 0.3);
    if (el.currentTime < threshold) return;
    playCountedRef.current.add(track.id);
    try {
      const updated = await api.post<ContentItem>(`/content/${track.id}/play`);
      onTrackPlayed(updated);
    } catch {
      // Non-fatal — don't disrupt playback
    }
  }, [api, currentTrack, isSignedIn, onTrackPlayed]);

  // Auto-advance to next track when current ends
  const handleEnded = useCallback(() => {
    setCurrentIndex((idx) => {
      if (idx === null) return null;
      if (idx + 1 >= queue.length) {
        setIsPlaying(false);
        return idx;
      }
      return idx + 1;
    });
  }, [queue.length]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      currentIndex,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      playQueue,
      playSingle,
      toggle,
      next,
      prev,
      seek,
      audioRef,
      onTrackPlayed,
    }),
    [
      queue,
      currentIndex,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      playQueue,
      playSingle,
      toggle,
      next,
      prev,
      seek,
      onTrackPlayed,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={() => {
          const el = audioRef.current;
          if (!el) return;
          setCurrentTime(el.currentTime);
          void recordPlayIfEligible();
        }}
        onLoadedMetadata={() => {
          const el = audioRef.current;
          if (el) setDuration(el.duration);
        }}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
