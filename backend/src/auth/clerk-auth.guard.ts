import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkService } from './clerk.service';
import type { AuthedRequest } from './request-user.type';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly clerk: ClerkService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    let clerkUserId: string;
    try {
      const payload = await this.clerk.verifySessionToken(token);
      if (!payload.sub) throw new Error('token has no sub');
      clerkUserId = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid session token');
    }

    const user = await this.getOrCreateUser(clerkUserId);
    await this.ensureDefaultMembership(user.id);
    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id },
    });

    req.authUser = { user, memberships };
    return true;
  }

  // Every user gets a Membership on the default team the first time they
  // authenticate. If no team exists yet, we bootstrap one and make the first
  // authenticated user its OWNER; everyone else joins as MEMBER + LISTENER.
  // Upgrades to CREATOR happen via the creator-application flow.
  private async ensureDefaultMembership(userId: string) {
    const existing = await this.prisma.membership.findFirst({
      where: { userId },
    });
    if (existing) return;

    let defaultTeam = await this.prisma.team.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    const isBootstrap = !defaultTeam;
    if (!defaultTeam) {
      defaultTeam = await this.prisma.team.create({
        data: { name: 'Beathub', slug: 'beathub' },
      });
    }

    await this.prisma.membership.create({
      data: {
        userId,
        teamId: defaultTeam.id,
        role: isBootstrap ? 'OWNER' : 'MEMBER',
        personaType: isBootstrap ? null : 'LISTENER',
      },
    });
  }

  private extractToken(req: AuthedRequest): string | null {
    const header = req.headers.authorization;
    if (!header) return null;
    const [scheme, value] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !value) return null;
    return value;
  }

  private async getOrCreateUser(clerkUserId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (existing) return existing;

    const clerkUser = await this.clerk.getClerkUser(clerkUserId);
    const primaryEmail =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      throw new UnauthorizedException('Clerk user has no email address');
    }

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      null;

    return this.prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email: primaryEmail,
        name,
        avatarUrl: clerkUser.imageUrl ?? null,
      },
    });
  }
}
