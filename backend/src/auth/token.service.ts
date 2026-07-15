import { Injectable, InternalServerErrorException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
}

@Injectable()
export class TokenService {
  private readonly secret: string;

  constructor() {
    const secret = process.env.AUTH_JWT_SECRET;
    if (!secret) {
      throw new InternalServerErrorException('AUTH_JWT_SECRET must be set');
    }
    this.secret = secret;
  }

  sign(userId: string): string {
    return jwt.sign({ sub: userId }, this.secret, { expiresIn: '7d' });
  }

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret);
    if (typeof decoded === 'string' || !decoded.sub) {
      throw new Error('Invalid token payload');
    }
    return { sub: decoded.sub as string };
  }
}
