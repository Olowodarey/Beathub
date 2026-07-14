"use client";

import { useCallback, useEffect, useState } from "react";
import { Music2, ShieldCheck, ShieldQuestion, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApiClient } from "@/lib/api-client";
import type { CreatorApplication } from "@/types";

export function CreatorApplicationInline() {
  const api = useApiClient();
  const [application, setApplication] = useState<CreatorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

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

  const submit = useCallback(
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
        setExpanded(false);
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

  const wrapper =
    "flex flex-col gap-3 rounded-md border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between";

  if (application?.status === "PENDING") {
    return (
      <div className={wrapper}>
        <div className="flex items-start gap-2 text-sm">
          <ShieldQuestion className="mt-0.5 h-4 w-4 text-brand" />
          <div>
            <p className="font-medium">Creator application under review</p>
            <p className="text-xs text-muted-foreground">
              An admin will let you know soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (application?.status === "APPROVED") {
    return (
      <div className={wrapper}>
        <div className="flex items-start gap-2 text-sm">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-brand" />
          <div>
            <p className="font-medium">You&apos;re a creator</p>
            <p className="text-xs text-muted-foreground">
              Refresh and head to Content to upload your first track.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rejected = application?.status === "REJECTED";

  if (!expanded) {
    return (
      <div className={wrapper}>
        <div className="flex items-start gap-2 text-sm">
          <Music2 className="mt-0.5 h-4 w-4 text-brand" />
          <div>
            <p className="font-medium">
              {rejected
                ? "Previous creator application declined"
                : "Want to publish your own music?"}
            </p>
            <p className="text-xs text-muted-foreground">
              {rejected
                ? application?.reviewerNote
                  ? `Reviewer: ${application.reviewerNote}`
                  : "You can apply again below."
                : "Apply to become a creator and start uploading tracks."}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setExpanded(true)}>
          {rejected ? "Re-apply" : "Apply to be a creator"}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-md border bg-muted/30 p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Music2 className="h-4 w-4 text-brand" />
          {rejected ? "Re-apply to be a creator" : "Apply to be a creator"}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setExpanded(false)}
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell us about yourself — artist name, links, anything relevant."
        maxLength={1000}
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
