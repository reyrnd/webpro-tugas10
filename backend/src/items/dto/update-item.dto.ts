import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DIVISIONS, type DivisionType } from '../../auth/dto/register.dto.js';

export class UpdateItemDto {
  @ApiPropertyOptional({
    example: 'Baterai LiPo 4S 5200mAh (Unit #2)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  itemName?: string;

  @ApiPropertyOptional({
    example: 'Lemari B — Laci 1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  storagePlace?: string;

  @ApiPropertyOptional({
    enum: DIVISIONS,
    example: 'ROV',
  })
  @IsOptional()
  @IsEnum(DIVISIONS, { message: 'Divisi harus salah satu dari: AUV, ROV, KRSTI, KKI' })
  division?: DivisionType;

  @ApiPropertyOptional({
    example: 'Dipindahkan ke Lemari B setelah dipakai uji coba kolam.',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
  })
  @IsOptional()
  @IsString()
  evidenceImage?: string;

  @ApiPropertyOptional({
    example: 'Lab Robotik — Ruang Workshop B',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}
