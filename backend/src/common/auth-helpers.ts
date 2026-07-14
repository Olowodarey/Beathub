import { ForbiddenException } from '@nestjs/common';
import type { Role } from '@prisma/client';
import type { AuthedRequest } from '../auth/request-user.type';

export function requireTeamRole(
  authUser: NonNullable<AuthedRequest['authUser']> | undefined,
  teamId: string,
  allowed: Role[],
) {
  if (!authUser) throw new ForbiddenException('Not authenticated');
  const membership = authUser.memberships.find((m) => m.teamId === teamId);
  if (!membership) throw new ForbiddenException('Not a member of this team');
  if (allowed.length > 0 && !allowed.includes(membership.role)) {
    throw new ForbiddenException('Insufficient role for this team');
  }
  return membership;
}
