"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  DollarSign,
  Music2,
  Play,
  UserPlus,
  Users,
} from "lucide-react";
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
import type { LabelStats, RosterArtist } from "@/types";

const RATE_PER_PLAY = 0.004;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function LabelHome({ firstName }: { firstName: string }) {
  const api = useApiClient();
  const [stats, setStats] = useState<LabelStats | null>(null);
  const [roster, setRoster] = useState<RosterArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get<LabelStats>("/me/label/stats"),
      api.get<RosterArtist[]>("/me/label/roster"),
    ])
      .then(([s, r]) => {
        if (cancelled) return;
        setStats(s);
        setRoster(r);
      })
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [api]);

  const topArtists = [...roster]
    .sort((a, b) => b.totalPlays - a.totalPlays)
    .slice(0, 5);

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
            Your label
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            Welcome, {firstName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Sign artists, watch their plays add up, share earnings with your roster.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href="/dashboard/roster"
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground shadow-xs hover:bg-brand/90 sm:w-auto sm:justify-start"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Manage roster
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

      {error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load your label: {error.message}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatTile
          label="Signed artists"
          value={
            loading || !stats ? "—" : formatCompactNumber(stats.artistCount)
          }
          hint={
            stats && stats.artistCount === 0
              ? "Send your first invite"
              : undefined
          }
          icon={Users}
        />
        <StatTile
          label="Roster plays"
          value={
            loading || !stats ? "—" : formatCompactNumber(stats.totalPlays)
          }
          hint="Across all your artists"
          icon={Play}
        />
        <StatTile
          label="Roster earnings"
          value={
            loading || !stats ? "—" : formatCurrency(stats.earningsUsd)
          }
          hint={`$${RATE_PER_PLAY.toFixed(3)} per play`}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Top artists</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your best performers by play count.
              </p>
            </div>
            <Link
              href="/dashboard/roster"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Full roster <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : topArtists.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No artists yet</p>
                <p className="text-xs text-muted-foreground">
                  Head to Roster and invite a creator by email.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {topArtists.map((a, i) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground sm:flex">
                        {i + 1}
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand">
                        {initials(a.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                          {a.approvedTrackCount}{" "}
                          {a.approvedTrackCount === 1 ? "track" : "tracks"} ·{" "}
                          {formatCompactNumber(a.totalPlays)} plays
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-brand">
                      {formatCurrency(a.earningsUsd)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top tracks</CardTitle>
            <p className="text-sm text-muted-foreground">
              Best-performing tracks across your roster.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : !stats || stats.topTracks.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                Once your artists get plays, their top tracks show up here.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Track</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead className="text-right">Plays</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topTracks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm font-medium">
                        {t.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {t.artistName}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {t.playCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-brand">
                        {formatCurrency(t.earningsUsd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
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
