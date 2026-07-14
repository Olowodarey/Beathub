"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/current-user";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface Tab {
  label: string;
  href: string;
  roles?: Role[];
}

const tabs: Tab[] = [
  { label: "General", href: "/dashboard/settings/general" },
  { label: "Team & Invitations", href: "/dashboard/settings/team" },
  {
    label: "Billing",
    href: "/dashboard/settings/billing",
    roles: ["OWNER"],
  },
  {
    label: "System",
    href: "/dashboard/settings/system",
    roles: ["OWNER"],
  },
];

export function SettingsTabs() {
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();
  const role = currentUser.membership.role;
  const visible = tabs.filter(
    (tab) => !tab.roles || tab.roles.includes(role),
  );

  return (
    <div className="border-b">
      <nav
        role="tablist"
        aria-label="Settings sections"
        className="flex gap-6 overflow-x-auto"
      >
        {visible.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              role="tab"
              aria-selected={isActive}
              href={tab.href}
              className={cn(
                "-mb-px flex h-10 items-center whitespace-nowrap border-b-2 px-1 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
