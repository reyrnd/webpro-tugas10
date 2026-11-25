import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { Division, Role } from '../../prisma/generated/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto, type RoleType } from './dto/register.dto.js';
import type { AuthUser } from './jwt-auth.guard.js';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    // Seeder otomatis: pastikan selalu ada 1 akun PENGURUS default
    try {
      const existingPengurus = await this.prisma.user.findUnique({
        where: { username: 'pengurus' },
      });

      if (!existingPengurus) {
        const passwordHash = await bcrypt.hash('pengurus123', 10);
        await this.prisma.user.create({
          data: {
            username: 'pengurus',
            passwordHash,
            fullName: 'Pengurus Lab Robotik',
            division: 'AUV',
            role: 'PENGURUS',
          },
        });
        this.logger.log(
          'Seeder akun PENGURUS default dibuat -> username: "pengurus", password: "pengurus123"',
        );
      }
    } catch (error) {
      this.logger.warn(
        `Gagal menjalankan seeder pengurus (pastikan migrasi Prisma sudah dijalankan): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async register(dto: RegisterDto) {
    const normalizedUsername = dto.username.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
    if (existing) {
      throw new ConflictException(`Username "${normalizedUsername}" sudah terdaftar`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Semua pendaftar baru otomatis mendapat role ANGGOTA
    const user = await this.prisma.user.create({
      data: {
        username: normalizedUsername,
        passwordHash,
        fullName: dto.fullName.trim(),
        division: dto.division as Division,
        role: 'ANGGOTA',
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

  async listUsers(currentUser: AuthUser) {
    if (currentUser.role !== 'PENGURUS') {
      throw new ForbiddenException('Hanya Pengurus yang dapat melihat daftar anggota');
    }

    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        division: true,
        role: true,
        createdAt: true,
      },
      orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async updateUserRole(
    targetUserId: string,
    newRole: RoleType,
    currentUser: AuthUser,
  ) {
    if (currentUser.role !== 'PENGURUS') {
      throw new ForbiddenException('Hanya Pengurus yang dapat mengubah role anggota');
    }

    if (targetUserId === currentUser.sub) {
      throw new BadRequestException('Anda tidak dapat mengubah role akun Anda sendiri');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) {
      throw new NotFoundException('Anggota tidak ditemukan');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole as Role },
      select: {
        id: true,
        username: true,
        fullName: true,
        division: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
