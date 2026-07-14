"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiClient } from "@/lib/api-client";
import type { ContentItem } from "@/types";

export function UploadTrackForm({
  teamId,
  onUploaded,
}: {
  teamId: string;
  onUploaded: (item: ContentItem) => void;
}) {
  const api = useApiClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  const reset = () => {
    setTitle("");
    setGenre("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !genre.trim()) return;
    const form = new FormData();
    form.append("title", title.trim());
    form.append("genre", genre.trim());
    form.append("audio", file);
    setPending(true);
    try {
      const created = await api.upload<ContentItem>(
        `/teams/${teamId}/content`,
        form,
      );
      toast.success("Track uploaded — awaiting moderation");
      onUploaded(created);
      reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Upload failed",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Upload a track</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Midnight Runs"
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="House"
                required
                maxLength={60}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="audio">Audio file (MP3, WAV, FLAC, OGG — max 25 MB)</Label>
            <label
              htmlFor="audio"
              className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-dashed bg-muted/30 p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <Upload className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                {file ? (
                  <span className="font-medium">{file.name}</span>
                ) : (
                  <span className="text-muted-foreground">
                    Tap to choose an audio file
                  </span>
                )}
              </span>
            </label>
            <Input
              ref={fileRef}
              id="audio"
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={pending || !file || !title.trim() || !genre.trim()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {pending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
