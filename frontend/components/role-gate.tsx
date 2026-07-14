"use client";

import { useCurrentUser } from "@/lib/current-user";
import type { PersonaType, Role } from "@/types";

interface RoleGateProps {
  allow?: Role[];
  personas?: PersonaType[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGate({
  allow,
  personas,
  fallback = null,
  children,
}: RoleGateProps) {
  const { currentUser } = useCurrentUser();
  const { role, personaType } = currentUser.membership;

  if (allow && !allow.includes(role)) return <>{fallback}</>;
  if (personas && role === "MEMBER") {
    if (!personaType || !personas.includes(personaType)) return <>{fallback}</>;
  }
  return <>{children}</>;
}
