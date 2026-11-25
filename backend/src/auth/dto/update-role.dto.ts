import { IsEnum } from 'class-validator';
import { ROLES, type RoleType } from './register.dto.js';

export class UpdateRoleDto {
  @IsEnum(ROLES, { message: 'Role harus ANGGOTA atau PENGURUS' })
  role: RoleType;
}
