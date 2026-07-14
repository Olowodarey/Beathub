import type {
  ActivityItem,
  Campaign,
  ContentItem,
  CurrentUser,
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
} from "@/types";

const iso = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString();

export const mockTeam: Team = {
  id: "team_beathub",
  name: "Beathub Studios",
  slug: "beathub",
  logoUrl: null,
  createdAt: iso(420),
};

// A single "you" identity per role — the dev switcher picks one at a time.
// Wanted realistic names, plausible tenure.
export const mockUsers: Record<
  "owner" | "admin" | "creator" | "labelRep",
  User
> = {
  owner: {
    id: "usr_owner",
    name: "Ada Ferrero",
    email: "ada@beathub.co",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(410),
  },
  admin: {
    id: "usr_admin",
    name: "Marcus Ilyas",
    email: "marcus@beathub.co",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(210),
  },
  creator: {
    id: "usr_creator",
    name: "Juno West",
    email: "juno@westsound.fm",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(88),
  },
  labelRep: {
    id: "usr_label",
    name: "Priya Okafor",
    email: "priya@northlyric.com",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(140),
  },
};

const membershipFor = (
  userId: string,
  role: Role,
  personaType: Membership["personaType"],
  createdAt: string,
): Membership => ({
  id: `mem_${userId}`,
  userId,
  teamId: mockTeam.id,
  role,
  personaType,
  createdAt,
});

export const mockMemberships = {
  owner: membershipFor(
    mockUsers.owner.id,
    "OWNER",
    null,
    mockUsers.owner.createdAt,
  ),
  admin: membershipFor(
    mockUsers.admin.id,
    "ADMIN",
    null,
    mockUsers.admin.createdAt,
  ),
  creator: membershipFor(
    mockUsers.creator.id,
    "MEMBER",
    "CREATOR",
    mockUsers.creator.createdAt,
  ),
  labelRep: membershipFor(
    mockUsers.labelRep.id,
    "MEMBER",
    "LABEL_REP",
    mockUsers.labelRep.createdAt,
  ),
} satisfies Record<string, Membership>;

export type CurrentUserKey = keyof typeof mockUsers;

export const buildCurrentUser = (key: CurrentUserKey): CurrentUser => ({
  user: mockUsers[key],
  membership: mockMemberships[key],
  team: mockTeam,
});

// ---- Directory of users/creators visible in /dashboard/users ----
export const directoryUsers: Array<
  User & { role: Role; personaType: Membership["personaType"] }
> = [
  {
    ...mockUsers.owner,
    role: "OWNER",
    personaType: null,
  },
  {
    ...mockUsers.admin,
    role: "ADMIN",
    personaType: null,
  },
  {
    id: "usr_1",
    name: "Sana Okuda",
    email: "sana@ronincoast.fm",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(72),
    role: "MEMBER",
    personaType: "CREATOR",
  },
  {
    id: "usr_2",
    name: "Denis Kravchenko",
    email: "denis@grayline.audio",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(41),
    role: "MEMBER",
    personaType: "CREATOR",
  },
  {
    id: "usr_3",
    name: "Priya Okafor",
    email: "priya@northlyric.com",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(140),
    role: "MEMBER",
    personaType: "LABEL_REP",
  },
  {
    id: "usr_4",
    name: "Bram Delaney",
    email: "bram@paperkitesound.com",
    avatarUrl: null,
    status: "INVITED",
    createdAt: iso(3),
    role: "MEMBER",
    personaType: "CREATOR",
  },
  {
    id: "usr_5",
    name: "Ines Salgado",
    email: "ines@fieldrecords.co",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(198),
    role: "ADMIN",
    personaType: null,
  },
  {
    id: "usr_6",
    name: "Kwame Osei",
    email: "kwame@luxebeats.net",
    avatarUrl: null,
    status: "SUSPENDED",
    createdAt: iso(260),
    role: "MEMBER",
    personaType: "CREATOR",
  },
  {
    id: "usr_7",
    name: "Yui Nakamura",
    email: "yui@harborhouse.jp",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(310),
    role: "MEMBER",
    personaType: "LABEL_REP",
  },
  {
    id: "usr_8",
    name: "Lior Almog",
    email: "lior@dustpocket.io",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(15),
    role: "MEMBER",
    personaType: "CREATOR",
  },
  {
    id: "usr_9",
    name: "Ceren Aksoy",
    email: "ceren@bosphorusrecs.com",
    avatarUrl: null,
    status: "ACTIVE",
    createdAt: iso(102),
    role: "MEMBER",
    personaType: "CREATOR",
  },
];

// ---- Invitations ----
export const mockInvitation: Invitation = {
  id: "inv_1",
  token: "demo",
  email: "new-member@example.com",
  teamId: mockTeam.id,
  role: "MEMBER",
  personaType: "CREATOR",
  status: "PENDING",
  invitedById: mockUsers.owner.id,
  createdAt: iso(1),
  expiresAt: iso(-6), // valid for another 6 days
};

export const pendingInvitations: Invitation[] = [
  {
    id: "inv_2",
    token: "abc",
    email: "sofia.mendez@northlyric.com",
    teamId: mockTeam.id,
    role: "MEMBER",
    personaType: "LABEL_REP",
    status: "PENDING",
    invitedById: mockUsers.owner.id,
    createdAt: iso(2),
    expiresAt: iso(-5),
  },
  {
    id: "inv_3",
    token: "def",
    email: "tomas.brandt@example.com",
    teamId: mockTeam.id,
    role: "ADMIN",
    personaType: null,
    status: "PENDING",
    invitedById: mockUsers.owner.id,
    createdAt: iso(5),
    expiresAt: iso(-2),
  },
];

// ---- Content moderation queue ----
export const moderationQueue: ContentItem[] = [
  {
    id: "cnt_1",
    kind: "TRACK",
    title: "Midnight Static",
    uploaderId: "usr_1",
    uploaderName: "Sana Okuda",
    durationSeconds: 214,
    uploadedAt: iso(1),
    status: "PENDING",
    genre: "Ambient",
  },
  {
    id: "cnt_2",
    kind: "PODCAST",
    title: "The Sample Room, Ep. 42",
    uploaderId: "usr_2",
    uploaderName: "Denis Kravchenko",
    durationSeconds: 2870,
    uploadedAt: iso(1),
    status: "PENDING",
    genre: "Culture",
  },
  {
    id: "cnt_3",
    kind: "TRACK",
    title: "Coastal Drive (Radio Edit)",
    uploaderId: "usr_8",
    uploaderName: "Lior Almog",
    durationSeconds: 195,
    uploadedAt: iso(2),
    status: "PENDING",
    genre: "Electronic",
  },
  {
    id: "cnt_4",
    kind: "TRACK",
    title: "Two-Way Radio",
    uploaderId: "usr_9",
    uploaderName: "Ceren Aksoy",
    durationSeconds: 248,
    uploadedAt: iso(3),
    status: "APPROVED",
    genre: "Indie",
  },
  {
    id: "cnt_5",
    kind: "PODCAST",
    title: "Deep Cuts, Ep. 07",
    uploaderId: "usr_6",
    uploaderName: "Kwame Osei",
    durationSeconds: 3320,
    uploadedAt: iso(4),
    status: "REJECTED",
    genre: "Hip-Hop",
  },
  {
    id: "cnt_6",
    kind: "TRACK",
    title: "Small Rooms, Big Rooms",
    uploaderId: "usr_1",
    uploaderName: "Sana Okuda",
    durationSeconds: 187,
    uploadedAt: iso(5),
    status: "APPROVED",
    genre: "Ambient",
  },
];

// ---- Campaigns ----
export const campaigns: Campaign[] = [
  {
    id: "cmp_1",
    requesterId: "usr_creator",
    requesterName: mockUsers.creator.name,
    teamId: mockTeam.id,
    slotType: "HOMEPAGE_FEATURED",
    budgetUsd: 1200,
    startDate: iso(-3),
    endDate: iso(-17),
    status: "PENDING",
    reviewerId: null,
    reviewerNote: null,
    createdAt: iso(1),
  },
  {
    id: "cmp_2",
    requesterId: "usr_creator",
    requesterName: mockUsers.creator.name,
    teamId: mockTeam.id,
    slotType: "PLAYLIST_PLACEMENT",
    budgetUsd: 450,
    startDate: iso(-14),
    endDate: iso(-28),
    status: "APPROVED",
    reviewerId: mockUsers.admin.id,
    reviewerNote: "Approved. Placed on chill-focus playlist.",
    createdAt: iso(6),
  },
  {
    id: "cmp_3",
    requesterId: "usr_label",
    requesterName: mockUsers.labelRep.name,
    teamId: mockTeam.id,
    slotType: "GENRE_SPOTLIGHT",
    budgetUsd: 2800,
    startDate: iso(4),
    endDate: iso(-11),
    status: "ACTIVE",
    reviewerId: mockUsers.owner.id,
    reviewerNote: "Approved for indie spotlight.",
    createdAt: iso(9),
    impressions: 184_223,
    clicks: 4_112,
  },
  {
    id: "cmp_4",
    requesterId: "usr_1",
    requesterName: "Sana Okuda",
    teamId: mockTeam.id,
    slotType: "HOMEPAGE_FEATURED",
    budgetUsd: 800,
    startDate: iso(11),
    endDate: iso(4),
    status: "ENDED",
    reviewerId: mockUsers.admin.id,
    reviewerNote: "Ran a full week.",
    createdAt: iso(14),
    impressions: 96_401,
    clicks: 2_183,
  },
  {
    id: "cmp_5",
    requesterId: "usr_2",
    requesterName: "Denis Kravchenko",
    teamId: mockTeam.id,
    slotType: "GENRE_SPOTLIGHT",
    budgetUsd: 600,
    startDate: iso(-2),
    endDate: iso(-14),
    status: "PENDING",
    reviewerId: null,
    reviewerNote: null,
    createdAt: iso(0),
  },
  {
    id: "cmp_6",
    requesterId: "usr_9",
    requesterName: "Ceren Aksoy",
    teamId: mockTeam.id,
    slotType: "PLAYLIST_PLACEMENT",
    budgetUsd: 300,
    startDate: iso(1),
    endDate: iso(-13),
    status: "REJECTED",
    reviewerId: mockUsers.admin.id,
    reviewerNote: "Content not yet approved for placement.",
    createdAt: iso(2),
  },
];

// ---- Analytics ----
export const revenueSeries: RevenuePoint[] = [
  { month: "Jan", subscriptions: 42_100, ads: 8_300 },
  { month: "Feb", subscriptions: 44_800, ads: 9_100 },
  { month: "Mar", subscriptions: 47_600, ads: 10_400 },
  { month: "Apr", subscriptions: 46_200, ads: 11_200 },
  { month: "May", subscriptions: 51_800, ads: 12_800 },
  { month: "Jun", subscriptions: 54_300, ads: 14_100 },
  { month: "Jul", subscriptions: 58_900, ads: 15_600 },
];

export const userGrowthSeries: UserGrowthPoint[] = [
  { month: "Jan", creators: 812, listeners: 24_100 },
  { month: "Feb", creators: 891, listeners: 27_040 },
  { month: "Mar", creators: 973, listeners: 30_820 },
  { month: "Apr", creators: 1_042, listeners: 34_100 },
  { month: "May", creators: 1_156, listeners: 38_600 },
  { month: "Jun", creators: 1_262, listeners: 43_910 },
  { month: "Jul", creators: 1_388, listeners: 49_720 },
];

export const platformShare: PlatformShare[] = [
  { name: "iOS", value: 41 },
  { name: "Android", value: 33 },
  { name: "Web", value: 19 },
  { name: "Desktop", value: 7 },
];

export const regionShare: RegionShare[] = [
  { region: "North America", listeners: 22_400 },
  { region: "Europe", listeners: 15_900 },
  { region: "Latin America", listeners: 6_800 },
  { region: "Asia", listeners: 4_200 },
  { region: "Africa", listeners: 3_100 },
  { region: "Oceania", listeners: 1_020 },
];

export const subscriptionShare: SubscriptionShare[] = [
  { tier: "Free", value: 62 },
  { tier: "Plus", value: 28 },
  { tier: "Family", value: 10 },
];

// ---- Activity feed ----
export const activityFeed: ActivityItem[] = [
  {
    id: "act_1",
    kind: "USER_JOINED",
    actorName: "Bram Delaney",
    target: "joined as Creator",
    timestamp: iso(0),
  },
  {
    id: "act_2",
    kind: "CONTENT_APPROVED",
    actorName: "Marcus Ilyas",
    target: "approved “Coastal Drive (Radio Edit)”",
    timestamp: iso(0),
  },
  {
    id: "act_3",
    kind: "CAMPAIGN_REQUESTED",
    actorName: "Juno West",
    target: "requested Homepage Featured — $1,200",
    timestamp: iso(1),
  },
  {
    id: "act_4",
    kind: "CONTENT_REJECTED",
    actorName: "Ines Salgado",
    target: "rejected “Deep Cuts, Ep. 07”",
    timestamp: iso(1),
  },
  {
    id: "act_5",
    kind: "CAMPAIGN_APPROVED",
    actorName: "Ada Ferrero",
    target: "approved Genre Spotlight for Northlyric",
    timestamp: iso(2),
  },
  {
    id: "act_6",
    kind: "PAYOUT_SENT",
    actorName: "System",
    target: "sent monthly payouts to 812 creators",
    timestamp: iso(3),
  },
];

// ---- Billing ----
export const mockInvoices: Invoice[] = [
  {
    id: "inv_p_1",
    number: "INV-2026-011",
    amountUsd: 499,
    status: "PAID",
    issuedAt: iso(6),
  },
  {
    id: "inv_p_2",
    number: "INV-2026-010",
    amountUsd: 499,
    status: "PAID",
    issuedAt: iso(37),
  },
  {
    id: "inv_p_3",
    number: "INV-2026-009",
    amountUsd: 499,
    status: "PAID",
    issuedAt: iso(68),
  },
  {
    id: "inv_p_4",
    number: "INV-2026-008",
    amountUsd: 499,
    status: "PAID",
    issuedAt: iso(98),
  },
];

// ---- System health gauges ----
export const systemGauges: SystemGauge[] = [
  { label: "Uptime", value: 99.98, unit: "%", intent: "good" },
  { label: "Response time", value: 142, unit: "ms", intent: "good" },
  { label: "CPU usage", value: 46, unit: "%", intent: "good" },
  { label: "Memory usage", value: 71, unit: "%", intent: "warn" },
];

// ---- Aggregate stats for the overview page ----
export const overviewStats = {
  totalUsers: 51_204,
  totalCreators: 1_388,
  activeCreators: 1_047,
  totalRevenueUsd: 74_500,
  contentUploadsThisWeek: 236,
  adRevenueUsd: 15_600,
  adRevenueTrendPct: 11.4,
};
