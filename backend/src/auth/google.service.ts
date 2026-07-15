import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string | null;
  picture: string | null;
}

@Injectable()
export class GoogleService {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new InternalServerErrorException('GOOGLE_CLIENT_ID must be set');
    }
    this.clientId = clientId;
    this.client = new OAuth2Client(clientId);
  }

  async verify(idToken: string): Promise<GoogleProfile> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new Error('Google token missing subject or email');
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? null,
      picture: payload.picture ?? null,
    };
  }
}
