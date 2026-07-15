import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleService } from './google.service';
import { TokenService } from './token.service';

interface AuthResult {
  token: string;
  user: User;
}

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly google: GoogleService,
  ) {}

  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name?.trim() || null,
      },
    });

    return { token: this.tokens.sign(user.id), user };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { token: this.tokens.sign(user.id), user };
  }

  async googleAuth(idToken: string): Promise<AuthResult> {
    let profile;
    try {
      profile = await this.google.verify(idToken);
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    const email = profile.email.toLowerCase();

    // 1. Already linked by Google id.
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    // 2. Existing account with the same email — link Google to it.
    if (!user) {
      const byEmail = await this.prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        user = await this.prisma.user.update({
          where: { id: byEmail.id },
          data: {
            googleId: profile.googleId,
            avatarUrl: byEmail.avatarUrl ?? profile.picture,
            name: byEmail.name ?? profile.name,
          },
        });
      }
    }

    // 3. Brand new user.
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          googleId: profile.googleId,
          name: profile.name,
          avatarUrl: profile.picture,
        },
      });
    }

    return { token: this.tokens.sign(user.id), user };
  }
}
