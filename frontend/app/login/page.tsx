"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Role assignment happens via invitation token, not at sign-in — see
// /invite/[token]. This page is UI only; wire real OAuth (Clerk) later.
export default function LoginPage() {
  const router = useRouter();
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/20 px-4">
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
                Sign in to Beathub
              </h1>
              <p className="text-sm text-muted-foreground">
                Use your Google account to continue.
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                <GoogleGlyph />
                Continue with Google
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By continuing you agree to our terms and privacy policy.
              </p>
            </div>
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

function GoogleGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.6 12.227c0-.79-.07-1.55-.201-2.28H12v4.313h5.394a4.61 4.61 0 0 1-2 3.023v2.51h3.234c1.894-1.744 2.972-4.312 2.972-7.566Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.964-.895 6.618-2.427l-3.234-2.51c-.895.6-2.04.955-3.384.955-2.6 0-4.803-1.756-5.59-4.114H3.06v2.585A9.996 9.996 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.41 13.904a5.995 5.995 0 0 1 0-3.808V7.51H3.06a10.008 10.008 0 0 0 0 8.98l3.35-2.586Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.978c1.468 0 2.786.505 3.823 1.496l2.867-2.867C16.96 3.031 14.696 2 12 2A9.996 9.996 0 0 0 3.06 7.51l3.35 2.586C7.197 7.734 9.4 5.978 12 5.978Z"
        fill="#EA4335"
      />
    </svg>
  );
}
