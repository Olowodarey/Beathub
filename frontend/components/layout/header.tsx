"use client";

import { LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/layout/command-palette";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useCurrentUser } from "@/lib/current-user";

const roleLabel = (role: string, personaType: string | null) => {
  if (role === "MEMBER") {
    if (personaType === "LABEL_REP") return "Label rep";
    if (personaType === "CREATOR") return "Creator";
    return "Listener";
  }
  return role.charAt(0) + role.slice(1).toLowerCase();
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function Header() {
  const { open, setOpen } = useCommandPalette();
  const { currentUser } = useCurrentUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:gap-3 sm:px-4">
        <MobileNav />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search or run a command"
          className="flex h-9 flex-1 items-center gap-2 rounded-md border bg-muted/40 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-md"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          <span className="hidden flex-1 truncate sm:inline">
            Search or run a command…
          </span>
          <kbd className="hidden items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                aria-label="Account menu"
              />
            }
          >
            <Avatar className="h-8 w-8">
              {currentUser?.user.avatarUrl ? (
                <AvatarImage src={currentUser.user.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback className="bg-brand/10 text-xs font-medium text-brand">
                {initials(currentUser?.user.name ?? "?")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm">
                  {currentUser?.user.name ?? "…"}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {currentUser?.user.email ?? ""}
                </span>
                {currentUser ? (
                  <span className="mt-1 text-xs font-normal text-muted-foreground">
                    {roleLabel(
                      currentUser.membership.role,
                      currentUser.membership.personaType,
                    )}{" "}
                    · {currentUser.team.name}
                  </span>
                ) : null}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" aria-hidden />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
