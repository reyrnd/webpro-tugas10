import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const DIVISIONS = ['AUV', 'ROV', 'KRSTI', 'KKI'] as const;
export type DivisionType = (typeof DIVISIONS)[number];

export const ROLES = ['ANGGOTA', 'PENGURUS'] as const;
export type RoleType = (typeof ROLES)[number];

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(100)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEnum(DIVISIONS, { message: 'Divisi harus salah satu dari: AUV, ROV, KRSTI, KKI' })
  division: DivisionType;

  @IsOptional()
  @IsEnum(ROLES, { message: 'Role harus ANGGOTA atau PENGURUS' })
  role?: RoleType;
}
