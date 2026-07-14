"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
  Music2,
  Play,
  Upload,
} from "lucide-react";
import { LabelInviteInbox } from "@/components/dashboard/label-invite-inbox";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiClient } from "@/lib/api-client";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import type { DashboardResponse } from "@/lib/api-types";
import type { ContentItem } from "@/types";

const RATE_PER_PLAY = 0.004;

export function CreatorHome({
  teamId,
  userId,
  firstName,
}: {
  teamId: string;
  userId: string;
  firstName: string;
}) {
  const api = useApiClient();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [myTracks, setMyTracks] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get<DashboardResponse>(`/teams/${teamId}/dashboard`),
      api.get<ContentItem[]>(`/teams/${teamId}/content`),
    ])
      .then(([d, allContent]) => {
        if (cancelled) return;
        setDashboard(d);
        setMyTracks(allContent.filter((c) => c.uploaderId === userId));
      })
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [api, teamId, userId]);

  const topTracks = useMemo(
    () =>
      [...myTracks].sort((a, b) => b.playCount - a.playCount).slice(0, 10),
    [myTracks],
  );

  const viewer = dashboard?.viewer;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-brand/25 via-brand/5 to-accent/25 p-5 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-accent/40 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-widest text-brand">
            Your studio
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Track how your catalog is doing and see what&apos;s earning.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href="/dashboard/content"
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground shadow-xs hover:bg-brand/90 sm:w-auto sm:justify-start"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload a track
            </Link>
            <Link
              href="/dashboard/library"
              className="inline-flex h-9 w-full items-center justify-center rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted sm:w-auto sm:justify-start"
            >
              <Music2 className="mr-2 h-4 w-4" />
              Browse library
            </Link>
          </div>
        </div>
      </div>

      <LabelInviteInbox />

      {error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load your stats: {error.message}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatTile
          label="Plays"
          value={
            loading || !viewer ? "—" : formatCompactNumber(viewer.plays)
          }
          hint="Across your approved tracks"
          icon={Play}
        />
        <StatTile
          label="Estimated earnings"
          value={
            loading || !viewer ? "—" : formatCurrency(viewer.earningsUsd)
          }
          hint={`$${RATE_PER_PLAY.toFixed(3)} per play`}
          icon={DollarSign}
        />
        <StatTile
          label="Uploads"
          value={
            loading || !viewer ? "—" : formatCompactNumber(viewer.uploadCount)
          }
          hint={
            myTracks.length
              ? `${myTracks.filter((t) => t.status === "PENDING").length} awaiting review`
              : undefined
          }
          icon={Music2}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Your top tracks</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sorted by play count. Every play adds ${RATE_PER_PLAY.toFixed(3)} to your earnings.
            </p>
          </div>
          <Link
            href="/dashboard/content"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            See all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading tracks…</p>
          ) : topTracks.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              You haven&apos;t uploaded any tracks yet. Head to Content to add
              your first.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[40px] sm:table-cell">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden w-[20%] sm:table-cell">Genre</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                    <TableHead className="hidden w-[10%] text-right sm:table-cell">Plays</TableHead>
                    <TableHead className="w-[12%] text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topTracks.map((track, i) => (
                    <TableRow key={track.id}>
                      <TableCell className="hidden text-sm tabular-nums text-muted-foreground sm:table-cell">
                        {i + 1}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {track.title}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        {track.genre}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={track.status} />
                      </TableCell>
                      <TableCell className="hidden text-right text-sm tabular-nums sm:table-cell">
                        {track.playCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-brand">
                        {formatCurrency(
                          Math.round(track.playCount * RATE_PER_PLAY * 100) / 100,
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Play;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
