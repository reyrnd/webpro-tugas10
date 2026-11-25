import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { DIVISIONS, type DivisionType } from '../../auth/dto/register.dto.js';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  itemName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  storagePlace: string;

  @IsOptional()
  @IsEnum(DIVISIONS, { message: 'Divisi harus salah satu dari: AUV, ROV, KRSTI, KKI' })
  division?: DivisionType;

  @IsString()
  @IsNotEmpty()
  note: string;

  @IsOptional()
  @IsString()
  evidenceImage?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;
}
