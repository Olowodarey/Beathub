"use client";

import { useState } from "react";
import { MailPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { pendingInvitations as seed } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { Invitation, Membership, Role } from "@/types";

const roleLabel = (role: Role, personaType: Membership["personaType"]) => {
  if (role === "MEMBER")
    return personaType === "LABEL_REP" ? "Label rep" : "Creator";
  return role.charAt(0) + role.slice(1).toLowerCase();
};

export function PendingInvitationsTable() {
  const [items, setItems] = useState<Invitation[]>(seed);

  const resend = (email: string) =>
    toast.success(`Invitation resent to ${email}`);

  const revoke = (id: string, email: string) => {
    setItems((prev) => prev.filter((invite) => invite.id !== id));
    toast.success(`Invitation to ${email} revoked`);
  };

  if (items.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={MailPlus}
          title="No pending invitations"
          description="Once you invite someone, they'll show up here until they accept."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="text-sm font-medium">
                {invite.email}
              </TableCell>
              <TableCell className="text-sm">
                {roleLabel(invite.role, invite.personaType)}
              </TableCell>
              <TableCell>
                <StatusBadge status={invite.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(invite.expiresAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resend(invite.email)}
                  >
                    Resend
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => revoke(invite.id, invite.email)}
                  >
                    Revoke
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
