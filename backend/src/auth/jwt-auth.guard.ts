import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import type { AuthedRequest } from './request-user.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    let userId: string;
    try {
      userId = this.tokens.verify(token).sub;
    } catch {
      throw new UnauthorizedException('Invalid session token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Account no longer exists');

    await this.ensureDefaultMembership(user.id);
    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id },
    });

    req.authUser = { user, memberships };
    return true;
  }

  // Every user gets a Membership on the default team the first time they
  // authenticate. The team is bootstrapped on demand. Whichever user matches
  // OWNER_EMAIL is assigned the OWNER role; everyone else joins as MEMBER +
  // LISTENER. Upgrades to CREATOR happen via the creator-application flow.
  private async ensureDefaultMembership(userId: string) {
    const existing = await this.prisma.membership.findFirst({
      where: { userId },
    });
    if (existing) return;

    let defaultTeam = await this.prisma.team.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    if (!defaultTeam) {
      defaultTeam = await this.prisma.team.create({
        data: { name: 'Beathub', slug: 'beathub' },
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
    const isOwner = !!ownerEmail && user?.email.toLowerCase() === ownerEmail;

    await this.prisma.membership.create({
      data: {
        userId,
        teamId: defaultTeam.id,
        role: isOwner ? 'OWNER' : 'MEMBER',
        personaType: isOwner ? null : 'LISTENER',
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
}
