import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const DIVISIONS = ['AUV', 'ROV', 'KRSTI', 'KKI'] as const;
export type DivisionType = (typeof DIVISIONS)[number];

export const ROLES = ['ANGGOTA', 'PENGURUS'] as const;
export type RoleType = (typeof ROLES)[number];

export class RegisterDto {
  @ApiProperty({
    example: 'reynard_auv',
    description: 'Username unik anggota lab (minimal 3 karakter)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    example: 'rahasia123',
    description: 'Password akun (minimal 6 karakter, akan di-hash dengan bcrypt)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(100)
  password: string;

  @ApiProperty({
    example: 'Reynard Pratama',
    description: 'Nama lengkap anggota lab',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    enum: DIVISIONS,
    example: 'AUV',
    description: 'Divisi robotik anggota (AUV, ROV, KRSTI, atau KKI)',
  })
  @IsEnum(DIVISIONS, { message: 'Divisi harus salah satu dari: AUV, ROV, KRSTI, KKI' })
  division: DivisionType;
}
