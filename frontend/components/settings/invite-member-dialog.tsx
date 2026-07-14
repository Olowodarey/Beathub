"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, useApiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/current-user";
import type { Invitation, PersonaType, Role } from "@/types";

type InviteRole = "ADMIN" | "MEMBER_CREATOR" | "MEMBER_LABEL_REP";

const toBackend = (
  key: InviteRole,
): { role: Role; personaType: PersonaType | null } => {
  if (key === "ADMIN") return { role: "ADMIN", personaType: null };
  if (key === "MEMBER_CREATOR")
    return { role: "MEMBER", personaType: "CREATOR" };
  return { role: "MEMBER", personaType: "LABEL_REP" };
};

export function InviteMemberDialog({
  onInvited,
}: {
  onInvited: (invitation: Invitation) => void;
}) {
  const api = useApiClient();
  const { activeTeamId } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("MEMBER_CREATOR");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeTeamId) return;
    setPending(true);
    try {
      const invitation = await api.post<Invitation>(
        `/teams/${activeTeamId}/invitations`,
        { email, ...toBackend(role) },
      );
      onInvited(invitation);
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setRole("MEMBER_CREATOR");
      setOpen(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to invite";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <UserPlus aria-hidden />
        Invite member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            They&apos;ll get a one-time invitation link.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as InviteRole)}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER_CREATOR">Creator</SelectItem>
                <SelectItem value="MEMBER_LABEL_REP">Label rep</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Owners can only be added by another owner via a separate flow.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !activeTeamId}>
              {pending ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
