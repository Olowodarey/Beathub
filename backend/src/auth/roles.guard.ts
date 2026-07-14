import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@prisma/client';
import { ROLES_METADATA_KEY } from './roles.decorator';
import type { AuthedRequest } from './request-user.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const authUser = req.authUser;
    if (!authUser) throw new ForbiddenException('Not authenticated');

    const teamId =
      (req.params as Record<string, string> | undefined)?.teamId ??
      (req.body as Record<string, unknown> | undefined)?.teamId;

    if (!teamId || typeof teamId !== 'string') {
      throw new ForbiddenException('teamId missing from request');
    }

    const membership = authUser.memberships.find((m) => m.teamId === teamId);
    if (!membership) throw new ForbiddenException('Not a member of this team');

    const allowed = this.reflector.get<Role[] | undefined>(
      ROLES_METADATA_KEY,
      context.getHandler(),
    );

    if (allowed && allowed.length > 0 && !allowed.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role for this team');
    }

    return true;
  }
}
