"use client";

import Link from "next/link";
import {
  Megaphone,
  Music2,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/lib/current-user";
import type { Role } from "@/types";

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  roles?: Role[];
}

const actions: QuickAction[] = [
  {
    label: "Review content",
    href: "/dashboard/content",
    icon: Music2,
    description: "Approve or reject pending uploads",
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Review campaigns",
    href: "/dashboard/promote",
    icon: Megaphone,
    description: "Vet incoming ad campaign requests",
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Request a campaign",
    href: "/dashboard/promote",
    icon: Megaphone,
    description: "Submit an ad slot request",
    roles: ["MEMBER"],
  },
  {
    label: "Invite a member",
    href: "/dashboard/settings/team",
    icon: UserPlus,
    description: "Add a teammate to your workspace",
    roles: ["OWNER"],
  },
];

export function QuickActions() {
  const { currentUser } = useCurrentUser();
  if (!currentUser) return null;
  const role = currentUser.membership.role;
  const visible = actions.filter(
    (action) => !action.roles || action.roles.includes(role),
  );

  if (visible.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Quick actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 rounded-md border bg-background p-3 transition-colors hover:border-brand/40 hover:bg-brand/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand">
                <action.icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{action.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
