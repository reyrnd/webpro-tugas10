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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from './jwt-auth.guard.js';

@ApiTags('1. Auth & Manajemen Anggota')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Registrasi akun anggota lab baru (Role otomatis ANGGOTA)',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return {
      statusCode: 201,
      message: 'Registrasi anggota lab berhasil',
      data,
    };
  }

  @ApiOperation({
    summary: 'Login anggota / pengurus untuk mendapatkan JWT Access Token',
    description: 'Akun seeder pengurus bawaan: username = "pengurus", password = "pengurus123"',
  })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return {
      statusCode: 200,
      message: 'Login berhasil',
      data,
    };
  }

  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lihat profil user yang sedang login' })
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

  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: '[Khusus PENGURUS] Ambil daftar seluruh anggota lab',
  })
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

  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: '[Khusus PENGURUS] Ubah role anggota (ANGGOTA <-> PENGURUS)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID anggota yang akan diubah rolenya',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
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
