import { Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDateRange } from "@/lib/format";
import type { Campaign } from "@/types";

const slotLabel: Record<Campaign["slotType"], string> = {
  HOMEPAGE_FEATURED: "Homepage Featured",
  GENRE_SPOTLIGHT: "Genre Spotlight",
  PLAYLIST_PLACEMENT: "Playlist Placement",
};

export function CampaignList({
  campaigns,
  emptyLabel = "No campaigns yet",
  emptyDescription = "Your campaign requests will show up here once you submit one.",
}: {
  campaigns: Campaign[];
  emptyLabel?: string;
  emptyDescription?: string;
}) {
  if (campaigns.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={Megaphone}
          title={emptyLabel}
          description={emptyDescription}
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slot</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Performance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="text-sm font-medium">
                {slotLabel[campaign.slotType]}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateRange(campaign.startDate, campaign.endDate)}
              </TableCell>
              <TableCell className="text-sm">
                {formatCurrency(campaign.budgetUsd)}
              </TableCell>
              <TableCell>
                <StatusBadge status={campaign.status} />
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {campaign.impressions
                  ? `${campaign.impressions.toLocaleString()} imp · ${campaign.clicks?.toLocaleString()} clicks`
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
