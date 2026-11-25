import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'pengurus',
    description: 'Username anggota atau pengurus (default seeder: pengurus)',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'pengurus123',
    description: 'Password akun (default seeder: pengurus123)',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
