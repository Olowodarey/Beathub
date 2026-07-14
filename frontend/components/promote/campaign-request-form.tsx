"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdSlotType } from "@/types";

const slotOptions: { value: AdSlotType; label: string; blurb: string }[] = [
  {
    value: "HOMEPAGE_FEATURED",
    label: "Homepage Featured",
    blurb: "Top slot on the discovery page, all listeners.",
  },
  {
    value: "GENRE_SPOTLIGHT",
    label: "Genre Spotlight",
    blurb: "Featured within a genre feed you pick.",
  },
  {
    value: "PLAYLIST_PLACEMENT",
    label: "Playlist Placement",
    blurb: "Included in one editorial playlist.",
  },
];

export function CampaignRequestForm() {
  const [slotType, setSlotType] = useState<AdSlotType>("HOMEPAGE_FEATURED");
  const [budget, setBudget] = useState("1000");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success("Campaign request submitted", {
      description:
        "It's now in the review queue. You'll get a notification when it's reviewed.",
    });
    setBudget("1000");
    setStartDate("");
    setEndDate("");
    setNotes("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Request a campaign</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick a slot, tell us your dates and budget, and an admin will review.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="slot">Slot type</Label>
            <Select
              value={slotType}
              onValueChange={(v) => setSlotType(v as AdSlotType)}
            >
              <SelectTrigger id="slot">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {slotOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.blurb}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="start">Start date</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End date</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="budget">Budget (USD)</Label>
            <Input
              id="budget"
              type="number"
              min="100"
              step="50"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes for the reviewer (optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Anything the review team should know…"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Submit request</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
