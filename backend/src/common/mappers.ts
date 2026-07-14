import type {
  AdCampaign,
  Content,
  Invitation,
  Membership,
  Team,
  User,
} from '@prisma/client';

export const mapUser = (u: User) => ({
  id: u.id,
  name: u.name ?? u.email,
  email: u.email,
  avatarUrl: u.avatarUrl,
  status: u.status,
  createdAt: u.createdAt.toISOString(),
});

export const mapTeam = (t: Team) => ({
  id: t.id,
  name: t.name,
  slug: t.slug,
  logoUrl: t.logoUrl,
  createdAt: t.createdAt.toISOString(),
});

export const mapMembership = (m: Membership) => ({
  id: m.id,
  userId: m.userId,
  teamId: m.teamId,
  role: m.role,
  personaType: m.personaType,
  createdAt: m.createdAt.toISOString(),
});

export const mapInvitation = (i: Invitation) => ({
  id: i.id,
  token: i.token,
  email: i.email,
  teamId: i.teamId,
  role: i.role,
  personaType: i.personaType,
  status: i.status,
  invitedById: i.invitedById,
  createdAt: i.createdAt.toISOString(),
  expiresAt: i.expiresAt.toISOString(),
});

export const mapContent = (c: Content & { uploader: User }) => ({
  id: c.id,
  kind: c.kind,
  title: c.title,
  uploaderId: c.uploaderId,
  uploaderName: c.uploader.name ?? c.uploader.email,
  durationSeconds: c.durationSeconds,
  uploadedAt: c.createdAt.toISOString(),
  status: c.status,
  genre: c.genre,
  audioUrl: c.audioUrl,
  playCount: c.playCount,
});

export const mapCampaign = (c: AdCampaign & { requester: User }) => ({
  id: c.id,
  requesterId: c.requesterId,
  requesterName: c.requester.name ?? c.requester.email,
  teamId: c.teamId,
  slotType: c.slotType,
  budgetUsd: c.budgetUsd,
  startDate: c.startDate.toISOString(),
  endDate: c.endDate.toISOString(),
  status: c.status,
  reviewerId: c.reviewerId,
  reviewerNote: c.reviewerNote,
  createdAt: c.createdAt.toISOString(),
  impressions: c.impressions ?? undefined,
  clicks: c.clicks ?? undefined,
});
