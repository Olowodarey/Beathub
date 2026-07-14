// Domain types for Beathub admin dashboard.
// Field names intentionally mirror a Prisma-shaped schema so swapping mock
// data for real DB queries later is a straight substitution, not a rewrite.

export type Role = "OWNER" | "ADMIN" | "MEMBER";

// MEMBER splits into two UI personas driven by personaType, NOT a separate role.
export type PersonaType = "LISTENER" | "CREATOR" | "LABEL_REP";

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CreatorApplication {
  id: string;
  userId: string;
  teamId: string;
  message: string | null;
  status: ApplicationStatus;
  reviewerId: string | null;
  reviewerNote: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface CreatorApplicationRow extends CreatorApplication {
  applicantName: string;
  applicantEmail: string;
  reviewerName: string | null;
}

export interface LabelApplication {
  id: string;
  userId: string;
  teamId: string;
  labelName: string | null;
  message: string | null;
  status: ApplicationStatus;
  reviewerId: string | null;
  reviewerNote: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface LabelApplicationRow extends LabelApplication {
  applicantName: string;
  applicantEmail: string;
  reviewerName: string | null;
}

export interface RosterArtist {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  approvedTrackCount: number;
  totalPlays: number;
  earningsUsd: number;
}

export interface LabelOutgoingInvite {
  id: string;
  artistUserId: string;
  artistName: string;
  artistEmail: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED";
  createdAt: string;
}

export interface LabelIncomingInvite {
  id: string;
  labelUserId: string;
  labelName: string;
  createdAt: string;
}

export interface LabelStats {
  artistCount: number;
  totalPlays: number;
  earningsUsd: number;
  topTracks: Array<{
    id: string;
    title: string;
    genre: string;
    playCount: number;
    artistName: string;
    earningsUsd: number;
  }>;
}

export interface PlaylistSummary {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  role: "owner" | "member";
  trackCount: number;
  memberCount: number;
  createdAt: string;
}

export interface PlaylistTrackEntry {
  entryId: string;
  position: number;
  addedAt: string;
  addedByName: string;
  track: ContentItem;
}

export interface PlaylistMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  addedAt: string;
}

export interface PlaylistDetail {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  viewerRole: "owner" | "member";
  createdAt: string;
  tracks: PlaylistTrackEntry[];
  members: PlaylistMember[];
}

export interface PendingInviteRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface MyPlaylistInvite {
  id: string;
  playlistId: string;
  playlistName: string;
  ownerName: string;
  invitedByName: string;
  trackCount: number;
  memberCount: number;
  createdAt: string;
}

export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  status: UserStatus;
  createdAt: string; // ISO
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  teamId: string;
  role: Role;
  personaType: PersonaType | null; // only meaningful when role === "MEMBER"
  createdAt: string;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface Invitation {
  id: string;
  token: string;
  email: string;
  teamId: string;
  role: Role;
  personaType: PersonaType | null;
  status: InvitationStatus;
  invitedById: string;
  createdAt: string;
  expiresAt: string;
}

// Content moderation
export type ContentKind = "TRACK" | "PODCAST";
export type ContentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  uploaderId: string;
  uploaderName: string;
  durationSeconds: number;
  uploadedAt: string;
  status: ContentStatus;
  genre: string;
  audioUrl: string | null;
  playCount: number;
}

// Ad marketplace
export type AdSlotType =
  | "HOMEPAGE_FEATURED"
  | "GENRE_SPOTLIGHT"
  | "PLAYLIST_PLACEMENT";

export type CampaignStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "ENDED";

export interface Campaign {
  id: string;
  requesterId: string;
  requesterName: string;
  teamId: string;
  slotType: AdSlotType;
  budgetUsd: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  reviewerId: string | null;
  reviewerNote: string | null;
  createdAt: string;
  impressions?: number;
  clicks?: number;
}

// Analytics / dashboard data
export interface RevenuePoint {
  month: string; // e.g. "Jan"
  subscriptions: number;
  ads: number;
}

export interface UserGrowthPoint {
  month: string;
  creators: number;
  listeners: number;
}

export interface PlatformShare {
  name: string; // "iOS" | "Android" | "Web" | "Desktop"
  value: number;
}

export interface RegionShare {
  region: string;
  listeners: number;
}

export interface SubscriptionShare {
  tier: string; // "Free" | "Plus" | "Family"
  value: number;
}

export type ActivityKind =
  | "USER_JOINED"
  | "CONTENT_APPROVED"
  | "CONTENT_REJECTED"
  | "CAMPAIGN_REQUESTED"
  | "CAMPAIGN_APPROVED"
  | "PAYOUT_SENT";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  actorName: string;
  target: string;
  timestamp: string;
}

// Billing
export interface Invoice {
  id: string;
  number: string; // e.g. "INV-2026-011"
  amountUsd: number;
  status: "PAID" | "OPEN" | "VOID";
  issuedAt: string;
}

// System health widgets
export interface SystemGauge {
  label: string;
  value: number; // 0..100
  unit: string;
  intent: "good" | "warn" | "bad";
}

// The role-aware "current user" used across pages (mock; real auth later).
export interface CurrentUser {
  user: User;
  membership: Membership;
  team: Team;
}
