"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, Clock3, UserPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ApiError, publicGet, useApiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/current-user";
import { formatDate } from "@/lib/format";
import type { InvitationLookupResponse } from "@/lib/api-types";
import { cn } from "@/lib/utils";

type ViewState =
  | "loading"
  | "pending"
  | "expired"
  | "revoked"
  | "accepted"
  | "not-found"
  | "error";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [invite, setInvite] = useState<InvitationLookupResponse | null>(null);
  const [state, setState] = useState<ViewState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    publicGet<InvitationLookupResponse>(`/invitations/${token}`)
      .then((data) => {
        if (cancelled) return;
        setInvite(data);
        const isExpired = new Date(data.expiresAt) < new Date();
        if (data.status === "REVOKED") setState("revoked");
        else if (data.status === "ACCEPTED") setState("accepted");
        else if (data.status === "EXPIRED" || isExpired) setState("expired");
        else setState("pending");
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) {
          setState("not-found");
        } else {
          setState("error");
          setError(e instanceof Error ? e.message : "Something went wrong");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

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
            {state === "loading" ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading invitation…
              </p>
            ) : state === "not-found" ? (
              <SimpleState
                tone="error"
                title="Invitation not found"
                message="This invitation link doesn't exist or has been removed."
              />
            ) : state === "expired" ? (
              <ExpiredInvite teamName={invite!.team.name} />
            ) : state === "revoked" ? (
              <SimpleState
                tone="error"
                title="Invitation revoked"
                message={`This invite to ${invite!.team.name} has been revoked.`}
              />
            ) : state === "accepted" ? (
              <AlreadyMemberInvite teamName={invite!.team.name} />
            ) : state === "error" ? (
              <SimpleState
                tone="error"
                title="Couldn't load invitation"
                message={error ?? "Try again in a moment."}
              />
            ) : (
              <PendingInvite invite={invite!} token={token!} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function PendingInvite({
  invite,
  token,
}: {
  invite: InvitationLookupResponse;
  token: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApiClient();
  const { refresh } = useCurrentUser();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabel =
    invite.role === "MEMBER"
      ? invite.personaType === "LABEL_REP"
        ? "Label Representative"
        : "Creator"
      : invite.role.charAt(0) + invite.role.slice(1).toLowerCase();

  const accept = async () => {
    setPending(true);
    setError(null);
    try {
      await api.post(`/invitations/${token}/accept`);
      await refresh();
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to accept");
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
          <UserPlus className="h-5 w-5" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          You&apos;ve been invited to join {invite.team.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Role:{" "}
          <span className="font-medium text-foreground">{roleLabel}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Invitation expires {formatDate(invite.expiresAt)}
        </p>
      </div>
      <div className="space-y-2">
        {!isLoaded ? (
          <Button size="lg" className="w-full" disabled>
            Loading…
          </Button>
        ) : isSignedIn ? (
          <Button
            size="lg"
            className="w-full"
            onClick={accept}
            disabled={pending}
          >
            {pending ? "Accepting…" : "Accept invitation"}
          </Button>
        ) : (
          <Link
            href={`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Sign in to accept
          </Link>
        )}
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "w-full",
          )}
        >
          Not now
        </Link>
        {error ? (
          <p className="text-center text-xs text-destructive">{error}</p>
        ) : null}
      </div>
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
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "w-full",
        )}
      >
        Back to sign in
      </Link>
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
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        Go to dashboard
      </Link>
    </div>
  );
}

function SimpleState({
  title,
  message,
  tone = "info",
}: {
  title: string;
  message: string;
  tone?: "info" | "error";
}) {
  return (
    <div className="space-y-4 py-4 text-center">
      <h1
        className={cn(
          "text-lg font-semibold tracking-tight",
          tone === "error" && "text-destructive",
        )}
      >
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "w-full",
        )}
      >
        Back to sign in
      </Link>
    </div>
  );
}
