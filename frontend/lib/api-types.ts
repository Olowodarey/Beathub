// Response envelope types for endpoints that aren't a single domain type.
// Domain types (User, Team, Campaign, etc.) live in @/types.

import type {
  ActivityItem,
  Campaign,
  ContentItem,
  Invitation,
  Invoice,
  Membership,
  PlatformShare,
  RegionShare,
  RevenuePoint,
  Role,
  SubscriptionShare,
  SystemGauge,
  Team,
  User,
  UserGrowthPoint,
  PersonaType,
} from "@/types";

export interface MeResponse {
  user: User;
  memberships: Membership[];
  teams: Team[];
}

export interface DashboardResponse {
  stats: {
    totalUsers: number;
    totalCreators: number;
    activeCreators: number;
    totalPlays: number;
    totalRevenueUsd: number;
    contentUploadsThisWeek: number;
    adRevenueUsd: number;
    adRevenueTrendPct: number;
  };
  viewer: {
    plays: number;
    earningsUsd: number;
    uploadCount: number;
  };
  recentActivity: ActivityItem[];
}

export interface AnalyticsResponse {
  revenueSeries: RevenuePoint[];
  userGrowthSeries: UserGrowthPoint[];
  platformShare: PlatformShare[];
  regionShare: RegionShare[];
  subscriptionShare: SubscriptionShare[];
}

export interface TeamUserRow {
  membership: Membership;
  user: User;
}

export interface InvitationLookupResponse {
  email: string;
  role: Role;
  personaType: PersonaType | null;
  status: Invitation["status"];
  expiresAt: string;
  team: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

export interface SystemHealthResponse {
  gauges: SystemGauge[];
}

export type { Campaign, ContentItem, Invitation, Invoice, Membership, Team, User };
