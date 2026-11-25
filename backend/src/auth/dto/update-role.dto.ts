import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ROLES, type RoleType } from './register.dto.js';

export class UpdateRoleDto {
  @ApiProperty({
    enum: ROLES,
    example: 'PENGURUS',
    description: 'Role baru untuk anggota (ANGGOTA atau PENGURUS)',
  })
  @IsEnum(ROLES, { message: 'Role harus ANGGOTA atau PENGURUS' })
  role: RoleType;
}
