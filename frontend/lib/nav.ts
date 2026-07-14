import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  Headphones,
  LayoutDashboard,
  ListMusic,
  Megaphone,
  Music2,
  Settings,
  ShieldCheck,
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
    label: "Home",
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
    label: "Creator applications",
    href: "/dashboard/creator-applications",
    icon: ShieldCheck,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Label applications",
    href: "/dashboard/label-applications",
    icon: Briefcase,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Roster",
    href: "/dashboard/roster",
    icon: Briefcase,
    // Only MEMBERs with LABEL_REP persona see this.
    personas: ["LABEL_REP"],
  },
  {
    label: "Content",
    href: "/dashboard/content",
    icon: Music2,
    // Listeners can't upload — the Content page is for creators and admins.
    personas: ["CREATOR", "LABEL_REP"],
  },
  {
    label: "Library",
    href: "/dashboard/library",
    icon: Headphones,
  },
  {
    label: "Playlists",
    href: "/dashboard/playlists",
    icon: ListMusic,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    // Analytics is for people making music / running the platform, not listeners.
    personas: ["CREATOR", "LABEL_REP"],
  },
  {
    label: "Promote",
    href: "/dashboard/promote",
    icon: Megaphone,
    personas: ["CREATOR", "LABEL_REP"],
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
