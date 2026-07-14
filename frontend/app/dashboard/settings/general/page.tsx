"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockTeam } from "@/lib/mock-data";

export default function SettingsGeneralPage() {
  const [name, setName] = useState(mockTeam.name);
  const [slug, setSlug] = useState(mockTeam.slug);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success("Workspace settings saved");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
          <p className="text-sm text-muted-foreground">
            Names and identifiers your team sees in the product.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-2 sm:max-w-md">
              <Label htmlFor="team-name">Team name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:max-w-md">
              <Label htmlFor="team-slug">URL slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  beathub.app/
                </span>
                <Input
                  id="team-slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Shown next to your team name across the app.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
              <ImageIcon className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  toast.info("Logo upload isn't wired up yet.", {
                    description: "This will accept SVG / PNG once the backend lands.",
                  })
                }
              >
                Upload logo
              </Button>
              <p className="text-xs text-muted-foreground">
                SVG or PNG · 256×256 recommended
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
