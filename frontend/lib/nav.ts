import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LayoutDashboard,
  Megaphone,
  Music2,
  Settings,
  Users,
} from "lucide-react";
import type { PersonaType, Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  // Roles allowed to see the item. Undefined = everyone.
  roles?: Role[];
  // Optional persona filter — used only for MEMBER role.
  personas?: PersonaType[];
}

export const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Content",
    href: "/dashboard/content",
    icon: Music2,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Promote",
    href: "/dashboard/promote",
    icon: Megaphone,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function canSee(
  item: NavItem,
  role: Role,
  personaType: PersonaType | null,
): boolean {
  if (item.roles && !item.roles.includes(role)) return false;
  if (item.personas && role === "MEMBER") {
    if (!personaType || !item.personas.includes(personaType)) return false;
  }
  return true;
}
