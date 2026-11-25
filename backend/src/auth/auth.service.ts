import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { Division, Role } from '../../prisma/generated/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { AuthUser } from './jwt-auth.guard.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedUsername = dto.username.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
    if (existing) {
      throw new ConflictException(`Username "${normalizedUsername}" sudah terdaftar`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: normalizedUsername,
        passwordHash,
        fullName: dto.fullName.trim(),
        division: dto.division as Division,
        role: (dto.role ?? 'ANGGOTA') as Role,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        division: true,
        role: true,
        createdAt: true,
      },
    });

    const payload: AuthUser = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      division: user.division,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user,
    };
  }

  async login(dto: LoginDto) {
    const normalizedUsername = dto.username.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const payload: AuthUser = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      division: user.division,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        division: user.division,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        division: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }
    return user;
  }
}
