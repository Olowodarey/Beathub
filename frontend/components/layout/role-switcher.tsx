"use client";

import { ChevronDown, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/lib/current-user";
import type { CurrentUserKey } from "@/lib/mock-data";

// Dev-only role preview. Persists via localStorage in RoleProvider.
// The "DEV:" label is intentional — we want this obviously not-production.
const ROLE_OPTIONS: Array<{ key: CurrentUserKey; label: string; hint: string }> =
  [
    { key: "owner", label: "Owner", hint: "Full access, billing, system" },
    { key: "admin", label: "Admin", hint: "Moderation + campaign review" },
    { key: "creator", label: "Creator", hint: "Own analytics + upload" },
    {
      key: "labelRep",
      label: "Label rep",
      hint: "Manages a roster of creators",
    },
  ];

export function RoleSwitcher() {
  const { activeKey, setActiveKey } = useCurrentUser();
  const active = ROLE_OPTIONS.find((option) => option.key === activeKey);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 border-dashed text-xs font-medium"
        >
          <FlaskConical
            className="h-3.5 w-3.5 text-muted-foreground"
            aria-hidden
          />
          <span className="text-muted-foreground">DEV: viewing as</span>
          <span>{active?.label ?? "—"}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Preview role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={activeKey}
          onValueChange={(value) => setActiveKey(value as CurrentUserKey)}
        >
          {ROLE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.key} value={option.key}>
              <div className="flex flex-col">
                <span className="text-sm">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.hint}
                </span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          Real auth wires up next — dev-only switch.
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
