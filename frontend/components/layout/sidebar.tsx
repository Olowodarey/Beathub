"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/current-user";
import { canSee, navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
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
    <aside className="sticky top-0 hidden h-svh w-16 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex lg:w-56">
      <div className="flex h-14 items-center gap-2 border-b px-3 lg:px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
          <span className="text-sm font-semibold">B</span>
        </div>
        <span className="hidden text-sm font-semibold tracking-tight lg:inline">
          Beathub
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2 lg:p-3">
        {visible.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex h-9 items-center gap-3 rounded-md px-2 text-sm font-medium transition-colors lg:px-3",
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
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
