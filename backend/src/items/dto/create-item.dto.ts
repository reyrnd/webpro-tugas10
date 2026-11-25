import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { DIVISIONS, type DivisionType } from '../../auth/dto/register.dto.js';

export class CreateItemDto {
  @ApiProperty({
    example: 'Baterai LiPo 4S 5200mAh',
    description: 'Nama barang atau komponen lab yang disimpan',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  itemName: string;

  @ApiProperty({
    example: 'Lemari A — Rak 2',
    description: 'Tempat penyimpanan detail di lab agar anggota lain tidak bingung',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  storagePlace: string;

  @ApiPropertyOptional({
    enum: DIVISIONS,
    example: 'AUV',
    description: 'Opsional (khusus Pengurus). Untuk Anggota otomatis mengikuti divisi akun.',
  })
  @IsOptional()
  @IsEnum(DIVISIONS, { message: 'Divisi harus salah satu dari: AUV, ROV, KRSTI, KKI' })
  division?: DivisionType;

  @ApiProperty({
    example: 'Baterai sudah di-charge 80% (storage mode), ditaruh di dalam LiPo safe bag merah.',
    description: 'Catatan kondisi atau keterangan posisi barang',
  })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiPropertyOptional({
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
    description: 'Foto evidence dalam bentuk Base64 Data URL (opsional)',
  })
  @IsOptional()
  @IsString()
  evidenceImage?: string;

  @ApiProperty({
    example: 'Lab Robotik — Gedung Teknik (-7.27970, 112.79720)',
    description: 'Lokasi ruangan atau koordinat GPS saat barang disimpan',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;
}
