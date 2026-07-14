"use client";

import { useEffect, useState } from "react";
import { ImageIcon, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useClerk, useUser } from "@clerk/nextjs";
import { CreatorApplicationInline } from "@/components/dashboard/creator-application-inline";
import { LabelApplicationInline } from "@/components/dashboard/label-application-inline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function SettingsGeneralPage() {
  const { currentUser } = useCurrentUser();
  const { user: clerkUser } = useUser();

  if (!currentUser) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const isAdmin =
    currentUser.membership.role === "OWNER" ||
    currentUser.membership.role === "ADMIN";
  const persona = currentUser.membership.personaType;
  const isMember = currentUser.membership.role === "MEMBER";
  const isListener = isMember && persona === "LISTENER";
  // Listeners and creators can both apply to become label owners.
  const canApplyForLabel =
    isMember && (persona === "LISTENER" || persona === "CREATOR");

  return (
    <div className="space-y-4">
      <ProfileCard
        name={currentUser.user.name}
        email={currentUser.user.email}
        role={roleLabel(
          currentUser.membership.role,
          currentUser.membership.personaType,
        )}
        avatarUrl={clerkUser?.imageUrl ?? currentUser.user.avatarUrl ?? null}
      />

      {isListener ? <CreatorApplicationInline /> : null}
      {canApplyForLabel ? <LabelApplicationInline /> : null}

      {isAdmin ? <WorkspaceCard /> : null}
      {isAdmin ? <LogoCard /> : null}
    </div>
  );
}

function ProfileCard({
  name,
  email,
  role,
  avatarUrl,
}: {
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your profile</CardTitle>
        <p className="text-sm text-muted-foreground">
          How you show up across Beathub.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 shrink-0">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback className="bg-brand/15 text-sm font-semibold text-brand">
                {initials(name || email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold">{name || email}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
              <p className="truncate text-xs text-muted-foreground">
                Role: <span className="font-medium text-foreground">{role}</span>
              </p>
            </div>
          </div>
          <ManageAccountButton />
        </div>
      </CardContent>
    </Card>
  );
}

function ManageAccountButton() {
  const { openUserProfile } = useClerk();
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full shrink-0 sm:w-auto"
      onClick={() => openUserProfile()}
    >
      <UserIcon className="mr-2 h-4 w-4" />
      Manage account
    </Button>
  );
}

function WorkspaceCard() {
  const { currentUser } = useCurrentUser();
  const team = currentUser?.team;
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (team) {
      setName(team.name);
      setSlug(team.slug);
    }
  }, [team]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    toast.info("Team edit endpoint isn't wired yet.");
  };

  if (!team) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Workspace</CardTitle>
        <p className="text-sm text-muted-foreground">
          Names and identifiers your team sees in the product.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-2 sm:max-w-md">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:max-w-md">
            <Label htmlFor="team-slug">URL slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">beathub.app/</span>
              <Input
                id="team-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function LogoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Logo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Shown next to your team name across the app.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
            <ImageIcon className="h-5 w-5" aria-hidden />
          </div>
          <div className="space-y-1">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                toast.info("Logo upload isn't wired up yet.", {
                  description:
                    "This will accept SVG / PNG once the endpoint lands.",
                })
              }
            >
              Upload logo
            </Button>
            <p className="text-xs text-muted-foreground">
              SVG or PNG · 256×256 recommended
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
