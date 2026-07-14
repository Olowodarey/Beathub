"use client";

import { useEffect, useMemo, useState } from "react";
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

  const newThisWeek = useMemo(() => tracks.slice(0, 6), [tracks]);
  const mostPlayed = useMemo(
    () => [...tracks].sort((a, b) => b.playCount - a.playCount).slice(0, 6),
    [tracks],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-brand/25 via-brand/5 to-accent/25 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-accent/40 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-widest text-brand">
            Now playing on Beathub
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Good to see you, {firstName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Fresh drops and the tracks everyone&apos;s playing.
          </p>
        </div>
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
          />
          <Section
            title="Most played"
            icon={Music2}
            emptyLabel="No plays yet — be the first."
            tracks={mostPlayed}
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
}: {
  title: string;
  icon: typeof Music2;
  emptyLabel: string;
  tracks: ContentItem[];
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
          {tracks.map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              queue={tracks}
              index={i}
            />
          ))}
        </div>
      )}
    </section>
  );
}
