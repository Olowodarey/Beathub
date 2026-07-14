"use client";

import { useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDateRange } from "@/lib/format";
import type { Campaign, CampaignStatus } from "@/types";

const slotLabel: Record<Campaign["slotType"], string> = {
  HOMEPAGE_FEATURED: "Homepage Featured",
  GENRE_SPOTLIGHT: "Genre Spotlight",
  PLAYLIST_PLACEMENT: "Playlist Placement",
};

type StatusFilter = "ALL" | CampaignStatus;

export function CampaignReviewQueue({
  campaigns,
  onDecide,
}: {
  campaigns: Campaign[];
  onDecide: (
    id: string,
    next: "APPROVED" | "REJECTED",
    note: string | null,
  ) => Promise<void>;
}) {
  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? campaigns
        : campaigns.filter((item) => item.status === filter),
    [filter, campaigns],
  );

  const decide = async (
    id: string,
    next: "APPROVED" | "REJECTED",
    note: string | null,
  ) => {
    setBusyId(id);
    try {
      await onDecide(id, next, note);
      toast.success(
        next === "APPROVED" ? "Campaign approved" : "Campaign rejected",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">Campaign review queue</CardTitle>
          <p className="text-sm text-muted-foreground">
            Vet incoming campaign requests before they go live.
          </p>
        </div>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as StatusFilter)}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ENDED">Ended</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No pending campaigns"
            description="You're all caught up — nothing here right now."
          />
        ) : (
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead className="hidden md:table-cell">Dates</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="text-sm font-medium">
                      {campaign.requesterName}
                    </TableCell>
                    <TableCell className="text-sm">
                      {slotLabel[campaign.slotType]}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {formatDateRange(campaign.startDate, campaign.endDate)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(campaign.budgetUsd)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={campaign.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.status === "PENDING" ? (
                        <ReviewControls
                          campaign={campaign}
                          onDecide={decide}
                          disabled={busyId === campaign.id}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {campaign.reviewerNote ?? "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewControls({
  campaign,
  onDecide,
  disabled,
}: {
  campaign: Campaign;
  onDecide: (
    id: string,
    next: "APPROVED" | "REJECTED",
    note: string | null,
  ) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<"APPROVED" | "REJECTED" | null>(null);

  const startDecision = (decision: "APPROVED" | "REJECTED") => {
    setPending(decision);
    setOpen(true);
  };

  const confirm = () => {
    if (!pending) return;
    onDecide(campaign.id, pending, note.trim() || null);
    setOpen(false);
    setNote("");
    setPending(null);
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => startDecision("REJECTED")}
        >
          Reject
        </Button>
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => startDecision("APPROVED")}
        >
          Approve
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pending === "APPROVED" ? "Approve campaign" : "Reject campaign"}
            </DialogTitle>
            <DialogDescription>
              {campaign.requesterName} · {slotLabel[campaign.slotType]} ·{" "}
              {formatCurrency(campaign.budgetUsd)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="review-note">Note (optional)</Label>
            <Textarea
              id="review-note"
              rows={3}
              placeholder="Add a message the requester will see."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirm}>
              Confirm {pending === "APPROVED" ? "approval" : "rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
