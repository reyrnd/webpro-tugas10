import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DIVISIONS, type DivisionType } from '../../auth/dto/register.dto.js';

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  itemName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  storagePlace?: string;

  @IsOptional()
  @IsEnum(DIVISIONS, { message: 'Divisi harus salah satu dari: AUV, ROV, KRSTI, KKI' })
  division?: DivisionType;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  evidenceImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}
