import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

function toPublicUser(user: {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  residence: string;
  role: 'CLIENT' | 'ADMIN';
  createdAt: Date;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    residence: user.residence,
    role: user.role,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet e-mail.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email.toLowerCase(),
        phone: dto.phone?.trim() || null,
        passwordHash,
        residence: dto.residence ?? 'TN',
      },
    });

    return this.buildSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    return this.buildSession(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return toPublicUser(user);
  }

  private buildSession(user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    residence: string;
    role: 'CLIENT' | 'ADMIN';
    createdAt: Date;
  }) {
    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { accessToken, user: toPublicUser(user) };
  }
}
