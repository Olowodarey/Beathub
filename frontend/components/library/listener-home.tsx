"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Music2, Sparkles } from "lucide-react";
import { TrackCard } from "@/components/library/track-card";
import { CreatorApplicationInline } from "@/components/dashboard/creator-application-inline";
import { EmptyState } from "@/components/empty-state";
import { useApiClient } from "@/lib/api-client";
import type { ContentItem } from "@/types";

export function ListenerHome({
  teamId,
  firstName,
}: {
  teamId: string;
  firstName: string;
}) {
  const api = useApiClient();
  const [tracks, setTracks] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<ContentItem[]>(`/teams/${teamId}/library`)
      .then((r) => !cancelled && setTracks(r))
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [api, teamId]);

  const handlePlayed = useCallback((updated: ContentItem) => {
    setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const newThisWeek = useMemo(() => tracks.slice(0, 6), [tracks]);
  const mostPlayed = useMemo(
    () => [...tracks].sort((a, b) => b.playCount - a.playCount).slice(0, 6),
    [tracks],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Good to see you, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fresh drops and the tracks everyone&apos;s playing.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading music…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load music: {error.message}
        </p>
      ) : tracks.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="Nothing to play yet"
          description="No approved tracks have been published to this team yet. Check back soon."
        />
      ) : (
        <>
          <Section
            title="New this week"
            icon={Sparkles}
            emptyLabel="Nothing new right now."
            tracks={newThisWeek}
            onPlayed={handlePlayed}
          />
          <Section
            title="Most played"
            icon={Music2}
            emptyLabel="No plays yet — be the first."
            tracks={mostPlayed}
            onPlayed={handlePlayed}
          />
          <div className="text-right">
            <Link
              href="/dashboard/library"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              Browse the full library
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}

      <CreatorApplicationInline />
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  emptyLabel,
  tracks,
  onPlayed,
}: {
  title: string;
  icon: typeof Music2;
  emptyLabel: string;
  tracks: ContentItem[];
  onPlayed: (updated: ContentItem) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Icon className="h-4 w-4 text-brand" />
        {title}
      </h2>
      {tracks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} onPlayed={onPlayed} />
          ))}
        </div>
      )}
    </section>
  );
}
