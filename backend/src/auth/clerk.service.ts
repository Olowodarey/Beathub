import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  createClerkClient,
  verifyToken,
  type ClerkClient,
} from '@clerk/backend';

@Injectable()
export class ClerkService {
  private readonly client: ClerkClient;
  private readonly secretKey: string;

  constructor() {
    const secretKey = process.env.CLERK_SECRET_KEY;
    const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
    if (!secretKey || !publishableKey) {
      throw new InternalServerErrorException(
        'CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY must be set',
      );
    }
    this.secretKey = secretKey;
    this.client = createClerkClient({ secretKey, publishableKey });
  }

  async verifySessionToken(token: string) {
    return verifyToken(token, { secretKey: this.secretKey });
  }

  async getClerkUser(clerkUserId: string) {
    return this.client.users.getUser(clerkUserId);
  }
}
