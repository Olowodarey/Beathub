"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/status-badge";
import type { User, Role } from "@/types";
import type { Membership } from "@/types";
import { formatDate } from "@/lib/format";

type DirectoryEntry = User & {
  role: Role;
  personaType: Membership["personaType"];
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const roleLabel = (role: Role, personaType: Membership["personaType"]) => {
  if (role === "MEMBER")
    return personaType === "LABEL_REP" ? "Label rep" : "Creator";
  return role.charAt(0) + role.slice(1).toLowerCase();
};

export function UserDetailSheet({
  entry,
  open,
  onOpenChange,
}: {
  entry: DirectoryEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        {entry ? (
          <>
            <SheetHeader>
              <SheetTitle className="sr-only">Member details</SheetTitle>
              <SheetDescription className="sr-only">
                Details for the selected team member.
              </SheetDescription>
            </SheetHeader>
            <div className="flex items-start gap-3 px-1">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-brand/10 text-sm font-medium text-brand">
                  {initials(entry.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">{entry.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {entry.email}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={entry.status} />
                  <span className="text-xs text-muted-foreground">
                    {roleLabel(entry.role, entry.personaType)}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <dl className="space-y-3 px-1 text-sm">
              <Row label="Joined" value={formatDate(entry.createdAt)} />
              <Row label="User ID" value={<code className="text-xs">{entry.id}</code>} />
              <Row
                label="Role"
                value={roleLabel(entry.role, entry.personaType)}
              />
              {entry.role === "MEMBER" ? (
                <Row
                  label="Persona"
                  value={
                    entry.personaType === "LABEL_REP" ? "Label rep" : "Creator"
                  }
                />
              ) : null}
            </dl>

            <Separator className="my-4" />

            <div className="px-1 text-xs text-muted-foreground">
              This is a read-only preview. Editing member details isn&apos;t
              wired up yet.
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
