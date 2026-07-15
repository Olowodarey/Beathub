"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
      theme: "outline",
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
    <main className="flex min-h-svh items-center justify-center bg-muted/20 px-4">
      {GOOGLE_CLIENT_ID ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setScriptLoaded(true)}
        />
      ) : null}
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <span className="text-sm font-semibold">B</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Beathub</span>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1 text-center">
              <h1 className="text-lg font-semibold tracking-tight">
                {mode === "signup"
                  ? "Create your account"
                  : "Sign in to Beathub"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Use your email and a password to get started."
                  : "Use your email and password, or continue with Google."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
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
              <Button type="submit" className="w-full" disabled={pending}>
                {pending
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </Button>
            </form>

            {error ? (
              <p className="mt-3 text-center text-xs text-destructive">
                {error}
              </p>
            ) : null}

            {GOOGLE_CLIENT_ID ? (
              <>
                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="flex justify-center">
                  <div ref={googleButtonRef} />
                </div>
              </>
            ) : null}

            <p className="mt-6 text-center text-sm text-muted-foreground">
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
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Have an invitation?{" "}
          <Link
            href="/invite/demo"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Open your invite
          </Link>
        </p>
      </div>
    </main>
  );
}
