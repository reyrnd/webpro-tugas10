import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return {
      statusCode: 201,
      message: 'Registrasi anggota lab berhasil',
      data,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return {
      statusCode: 200,
      message: 'Login berhasil',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    const data = await this.authService.getMe(req.user.sub);
    return {
      statusCode: 200,
      message: 'Berhasil mengambil profil pengguna',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async listUsers(@Req() req: AuthenticatedRequest) {
    const data = await this.authService.listUsers(req.user);
    return {
      statusCode: 200,
      message: 'Berhasil mengambil daftar anggota lab',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.authService.updateUserRole(id, dto.role, req.user);
    return {
      statusCode: 200,
      message: 'Role anggota berhasil diperbarui',
      data,
    };
  }
}
