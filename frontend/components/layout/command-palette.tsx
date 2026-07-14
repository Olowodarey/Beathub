"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCurrentUser } from "@/lib/current-user";
import { canSee, navItems } from "@/lib/nav";
import type { CurrentUserKey } from "@/lib/mock-data";

const ROLE_TARGETS: Array<{ key: CurrentUserKey; label: string }> = [
  { key: "owner", label: "Owner" },
  { key: "admin", label: "Admin" },
  { key: "creator", label: "Creator" },
  { key: "labelRep", label: "Label rep" },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { currentUser, setActiveKey } = useCurrentUser();
  const { role, personaType } = currentUser.membership;

  const navigable = navItems.filter((item) =>
    canSee(item, role, personaType),
  );

  const runAndClose = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Jump to a page or run a quick action."
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {navigable.map((item) => (
            <CommandItem
              key={item.href}
              value={`Go to ${item.label}`}
              onSelect={() => runAndClose(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" aria-hidden />
              Go to {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem
            value="Switch to light mode"
            onSelect={() => runAndClose(() => setTheme("light"))}
          >
            <Sun className="mr-2 h-4 w-4" aria-hidden />
            Switch to light mode
          </CommandItem>
          <CommandItem
            value="Switch to dark mode"
            onSelect={() => runAndClose(() => setTheme("dark"))}
          >
            <Moon className="mr-2 h-4 w-4" aria-hidden />
            Switch to dark mode
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Preview role (dev)">
          {ROLE_TARGETS.map((target) => (
            <CommandItem
              key={target.key}
              value={`Preview as ${target.label}`}
              onSelect={() => runAndClose(() => setActiveKey(target.key))}
            >
              Preview as {target.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return { open, setOpen };
}
