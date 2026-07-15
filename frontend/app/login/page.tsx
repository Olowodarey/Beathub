"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart, ListMusic, Megaphone } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const PASSWORD_RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

// Bars for the animated equalizer on the brand panel.
const EQ_BARS = [
  { delay: "0s", dur: "1.1s" },
  { delay: "0.25s", dur: "0.9s" },
  { delay: "0.1s", dur: "1.4s" },
  { delay: "0.4s", dur: "1.05s" },
  { delay: "0.15s", dur: "0.8s" },
  { delay: "0.5s", dur: "1.25s" },
  { delay: "0.05s", dur: "1s" },
  { delay: "0.32s", dur: "1.15s" },
  { delay: "0.2s", dur: "0.95s" },
];

const FEATURES = [
  { icon: ListMusic, label: "Curate playlists & manage your roster" },
  { icon: Megaphone, label: "Promote releases in the ad marketplace" },
  { icon: LineChart, label: "Track every play in real time" },
];

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const {
    isLoaded,
    isSignedIn,
    register,
    signInWithPassword,
    signInWithGoogle,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    passed: rule.test(password),
  }));
  const passwordValid = passwordChecks.every((c) => c.passed);
  const submitDisabled = pending || (mode === "signup" && !passwordValid);

  // Already signed in → skip the login screen.
  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) return;
      setError(null);
      setPending(true);
      try {
        await signInWithGoogle(response.credential);
        router.push("/dashboard");
      } catch (e) {
        setPending(false);
        setError((e as Error).message ?? "Google sign-in failed");
      }
    },
    [signInWithGoogle, router],
  );

  // Initialize and render Google's button once the script is ready.
  useEffect(() => {
    if (!scriptLoaded || !GOOGLE_CLIENT_ID) return;
    const google = window.google;
    if (!google || !googleButtonRef.current) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "filled_black",
      size: "large",
      width: 320,
      text: "continue_with",
    });
  }, [scriptLoaded, handleGoogleCredential]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "signup") {
        await register(email, password, name || undefined);
      } else {
        await signInWithPassword(email, password);
      }
      router.push("/dashboard");
    } catch (e) {
      setPending(false);
      setError((e as Error).message ?? "Something went wrong");
    }
  };

  return (
    <main className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {GOOGLE_CLIENT_ID ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setScriptLoaded(true)}
        />
      ) : null}

      {/* ---------- Brand panel ---------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 lg:flex xl:p-14">
        {/* ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-28 h-[26rem] w-[26rem] rounded-full bg-brand/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-16 h-[24rem] w-[24rem] rounded-full bg-primary/15 blur-[120px]"
        />

        {/* wordmark */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-lg shadow-brand/30">
            <span className="text-base font-bold">B</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            Beathub
          </span>
        </div>

        {/* headline + features */}
        <div className="relative max-w-md">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-brand">
            Admin dashboard
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-sidebar-foreground xl:text-[2.75rem]">
            Where your label{" "}
            <span className="bg-gradient-to-br from-brand to-primary bg-clip-text text-transparent">
              runs the show.
            </span>
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Manage your roster, moderate content, promote releases and watch
            every play — one fast, focused workspace for the whole team.
          </p>

          <ul className="mt-9 space-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent/60 text-brand">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm text-sidebar-foreground/90">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* equalizer footer */}
        <div className="relative flex items-end justify-between">
          <div className="flex h-10 items-end gap-[3px]" aria-hidden>
            {EQ_BARS.map((bar, i) => (
              <span
                key={i}
                className="eq-bar w-1.5 rounded-full bg-gradient-to-t from-brand/40 to-brand"
                style={{
                  height: "100%",
                  animationDelay: bar.delay,
                  animationDuration: bar.dur,
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Trusted by labels, creators & their teams
          </p>
        </div>
      </aside>

      {/* ---------- Form panel ---------- */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          {/* wordmark (mobile only — brand panel is hidden) */}
          <div className="mb-10 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
              <span className="text-sm font-semibold">B</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Beathub</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "signup"
                ? "Set up your account to get started."
                : "Sign in to your Beathub workspace."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-3.5">
            {mode === "signup" ? (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                required
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {mode === "signup" ? (
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                {passwordChecks.map((check) => (
                  <li
                    key={check.label}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      check.passed ? "text-emerald-400" : "text-muted-foreground"
                    }`}
                  >
                    <span aria-hidden>{check.passed ? "✓" : "○"}</span>
                    {check.label}
                  </li>
                ))}
              </ul>
            ) : null}
            <Button
              type="submit"
              className="mt-1 w-full"
              disabled={submitDisabled}
            >
              {pending
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>

          {error ? (
            <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
              {error}
            </p>
          ) : null}

          {GOOGLE_CLIENT_ID ? (
            <>
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  or continue with
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex justify-center [color-scheme:dark]">
                <div ref={googleButtonRef} />
              </div>
            </>
          ) : null}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to Beathub?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Create an account
                </button>
              </>
            )}
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Have an invitation?{" "}
            <Link
              href="/invite/demo"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Open your invite
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
