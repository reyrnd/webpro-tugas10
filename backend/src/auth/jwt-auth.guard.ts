import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface AuthUser {
  sub: string;
  username: string;
  fullName: string;
  division: 'AUV' | 'ROV' | 'KRSTI' | 'KKI';
  role: 'ANGGOTA' | 'PENGURUS';
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token autentikasi diperlukan');
    }

    const token = authHeader.slice(7).trim();
    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }
  }
}
