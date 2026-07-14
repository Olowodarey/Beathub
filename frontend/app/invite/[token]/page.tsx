import Link from "next/link";
import { CheckCircle2, Clock3, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { mockInvitation, mockTeam } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

// Next.js 16: params + searchParams are Promises and must be awaited.
type InviteState = "pending" | "expired" | "already-member";

const isState = (v: unknown): v is InviteState =>
  v === "pending" || v === "expired" || v === "already-member";

export default async function InvitePage(props: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ state?: string | string[] }>;
}) {
  const { token } = await props.params;
  const searchParams = await props.searchParams;
  const raw = Array.isArray(searchParams.state)
    ? searchParams.state[0]
    : searchParams.state;
  const state: InviteState = isState(raw) ? raw : "pending";

  const invite = mockInvitation;
  const roleLabel = invite.role === "MEMBER"
    ? invite.personaType === "LABEL_REP"
      ? "Label Representative"
      : "Creator"
    : invite.role.charAt(0) + invite.role.slice(1).toLowerCase();

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <span className="text-sm font-semibold">B</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Beathub</span>
        </div>

        <Card>
          <CardContent className="pt-6">
            {state === "pending" ? (
              <PendingInvite
                teamName={mockTeam.name}
                roleLabel={roleLabel}
                expiresAt={invite.expiresAt}
                token={token}
              />
            ) : state === "expired" ? (
              <ExpiredInvite teamName={mockTeam.name} />
            ) : (
              <AlreadyMemberInvite teamName={mockTeam.name} />
            )}
          </CardContent>
        </Card>

        {/* Preview links to toggle UI states while there's no real backend. */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          <span className="text-muted-foreground">Preview states:</span>
          <Link
            className="rounded border bg-background px-2 py-1 hover:bg-muted"
            href={`/invite/${token}`}
          >
            pending
          </Link>
          <Link
            className="rounded border bg-background px-2 py-1 hover:bg-muted"
            href={`/invite/${token}?state=expired`}
          >
            expired
          </Link>
          <Link
            className="rounded border bg-background px-2 py-1 hover:bg-muted"
            href={`/invite/${token}?state=already-member`}
          >
            already member
          </Link>
        </div>
      </div>
    </main>
  );
}

function PendingInvite({
  teamName,
  roleLabel,
  expiresAt,
  token,
}: {
  teamName: string;
  roleLabel: string;
  expiresAt: string;
  token: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
          <UserPlus className="h-5 w-5" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          You&apos;ve been invited to join {teamName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Role:{" "}
          <span className="font-medium text-foreground">{roleLabel}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Invitation expires {formatDate(expiresAt)}
        </p>
      </div>
      <div className="space-y-2">
        <Button className="w-full" asChild>
          <Link href="/dashboard">Accept invitation</Link>
        </Button>
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/login">Not now</Link>
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Invite token: <span className="font-mono">{token}</span>
      </p>
    </div>
  );
}

function ExpiredInvite({ teamName }: { teamName: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Clock3 className="h-5 w-5" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          This invitation has expired
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask an owner of {teamName} to send you a fresh invite.
        </p>
        <div className="mt-3">
          <StatusBadge status="EXPIRED" />
        </div>
      </div>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}

function AlreadyMemberInvite({ teamName }: { teamName: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          You&apos;re already a member
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;re already part of {teamName}. Head to the dashboard to keep
          working.
        </p>
      </div>
      <Button className="w-full" asChild>
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}
