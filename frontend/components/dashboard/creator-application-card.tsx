"use client";

import { useCallback, useEffect, useState } from "react";
import { Music2, ShieldCheck, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useApiClient } from "@/lib/api-client";
import type { CreatorApplication } from "@/types";

export function CreatorApplicationCard() {
  const api = useApiClient();
  const [application, setApplication] = useState<CreatorApplication | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<CreatorApplication | null>("/me/creator-application")
      .then((r) => !cancelled && setApplication(r))
      .catch(() => !cancelled && setApplication(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [api]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPending(true);
      try {
        const created = await api.post<CreatorApplication>(
          "/me/creator-application",
          { message: message.trim() || undefined },
        );
        setApplication(created);
        toast.success("Application submitted");
        setMessage("");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Couldn't submit application",
        );
      } finally {
        setPending(false);
      }
    },
    [api, message],
  );

  if (loading) return null;

  if (application?.status === "PENDING") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShieldQuestion className="h-4 w-4" />
            Creator application under review
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Submitted on {new Date(application.createdAt).toLocaleDateString()}.
          {" "}You&apos;ll get creator access here as soon as an admin approves.
        </CardContent>
      </Card>
    );
  }

  if (application?.status === "REJECTED") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShieldQuestion className="h-4 w-4" />
            Previous creator application declined
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {application.reviewerNote ? (
            <p className="text-muted-foreground">
              Reviewer note: {application.reviewerNote}
            </p>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Anything to add? Recent releases, socials, why you'd like access…"
              maxLength={1000}
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={pending} size="sm">
                <Music2 className="mr-2 h-4 w-4" />
                {pending ? "Submitting…" : "Re-apply"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (application?.status === "APPROVED") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            You&apos;re a creator now
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Head to Content to upload your first track. Refresh if the sidebar hasn&apos;t caught up.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Want to publish music on Beathub?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Apply to become a creator. Once an admin approves, you can upload
          tracks and start earning per play.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about yourself — artist name, links, anything relevant."
            maxLength={1000}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} size="sm">
              <Music2 className="mr-2 h-4 w-4" />
              {pending ? "Submitting…" : "Apply to be a creator"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
