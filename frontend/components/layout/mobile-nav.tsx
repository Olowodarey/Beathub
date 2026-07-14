"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCurrentUser } from "@/lib/current-user";
import { canSee, navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();

  const visible = currentUser
    ? navItems.filter((item) =>
        canSee(
          item,
          currentUser.membership.role,
          currentUser.membership.personaType,
        ),
      )
    : [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="h-5 w-5" aria-hidden />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 gap-0 bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="h-14 flex-row items-center gap-2 border-b px-4 py-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <span className="text-sm font-semibold">B</span>
          </div>
          <SheetTitle className="text-sm font-semibold tracking-tight">
            Beathub
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {visible.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-foreground shadow-[inset_2px_0_0_var(--brand)]",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-brand" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
