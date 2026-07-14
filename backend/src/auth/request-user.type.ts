import type { Membership, User } from '@prisma/client';
import type { Request } from 'express';

export interface AuthedRequest extends Request {
  authUser?: {
    user: User;
    memberships: Membership[];
  };
}
