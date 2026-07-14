import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { directoryUsers } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { Membership, Role } from "@/types";

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

export function MemberList() {
  return (
    <Card className="overflow-hidden p-0">
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
          {directoryUsers.map((entry) => (
            <TableRow key={entry.id}>
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
    </Card>
  );
}
