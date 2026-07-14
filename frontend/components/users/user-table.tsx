"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { UserDetailSheet } from "@/components/users/user-detail-sheet";
import { directoryUsers } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { Role, User } from "@/types";
import type { Membership } from "@/types";
import { cn } from "@/lib/utils";

type DirectoryEntry = (typeof directoryUsers)[number];

type RoleFilter = "ALL" | Role | "MEMBER_CREATOR" | "MEMBER_LABEL_REP";

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

const matchesFilter = (entry: DirectoryEntry, filter: RoleFilter) => {
  if (filter === "ALL") return true;
  if (filter === "OWNER" || filter === "ADMIN") return entry.role === filter;
  if (filter === "MEMBER_CREATOR")
    return entry.role === "MEMBER" && entry.personaType === "CREATOR";
  if (filter === "MEMBER_LABEL_REP")
    return entry.role === "MEMBER" && entry.personaType === "LABEL_REP";
  return true;
};

export function UserTable() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RoleFilter>("ALL");
  const [selected, setSelected] = useState<DirectoryEntry | null>(null);

  const rows = useMemo(
    () =>
      directoryUsers.filter((entry) => {
        if (!matchesFilter(entry, filter)) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          entry.name.toLowerCase().includes(q) ||
          entry.email.toLowerCase().includes(q)
        );
      }),
    [filter, query],
  );

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search by name or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as RoleFilter)}>
          <SelectTrigger className="h-9 w-full sm:w-52">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            <SelectItem value="OWNER">Owner</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MEMBER_CREATOR">Creator</SelectItem>
            <SelectItem value="MEMBER_LABEL_REP">Label rep</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-4 overflow-hidden p-0">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No members match those filters"
              description="Try clearing your search or picking a different role."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={cn(
                    "cursor-pointer",
                    selected?.id === entry.id && "bg-muted/60",
                  )}
                  onClick={() => setSelected(entry)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-brand/10 text-xs font-medium text-brand">
                          {initials(entry.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{entry.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {roleLabel(entry.role, entry.personaType)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={entry.status} />
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <UserDetailSheet
        entry={selected}
        open={selected !== null}
        onOpenChange={(next) => {
          if (!next) setSelected(null);
        }}
      />
    </>
  );
}

export type { DirectoryEntry };
export type { User };
