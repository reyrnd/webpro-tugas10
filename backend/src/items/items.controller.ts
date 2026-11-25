import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../auth/jwt-auth.guard.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { ItemsService } from './items.service.js';

@ApiTags('2. Inventaris Barang Lab (CRUD)')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @ApiOperation({
    summary: 'CREATE — Simpan barang baru ke inventaris lab',
  })
  @Post()
  async create(
    @Body() dto: CreateItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.itemsService.create(dto, req.user);
    return {
      statusCode: 201,
      message: 'Barang lab berhasil disimpan',
      data,
    };
  }

  @ApiOperation({
    summary: 'READ ALL — Ambil daftar barang (otomatis sesuai divisi untuk ANGGOTA, semua divisi untuk PENGURUS)',
  })
  @ApiQuery({
    name: 'division',
    required: false,
    enum: ['AUV', 'ROV', 'KRSTI', 'KKI'],
    description: 'Filter berdasarkan divisi (khusus PENGURUS)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Kata kunci pencarian (nama barang, tempat/lemari, nama anggota, atau catatan)',
  })
  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('division') division?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.itemsService.findAll(req.user, division, search);
    return {
      statusCode: 200,
      message: 'Berhasil mengambil daftar barang lab',
      data,
    };
  }

  @ApiOperation({
    summary: 'STATS (Query Lanjutan) — Statistik jumlah barang total dan per divisi (count & groupBy)',
  })
  @Get('stats')
  async getStats(@Req() req: AuthenticatedRequest) {
    const data = await this.itemsService.getStats(req.user);
    return {
      statusCode: 200,
      message: 'Berhasil mengambil statistik inventaris lab',
      data,
    };
  }

  @ApiOperation({
    summary: 'READ ONE — Ambil detail 1 barang berdasarkan UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID barang lab',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.itemsService.findOne(id, req.user);
    return {
      statusCode: 200,
      message: 'Berhasil mengambil detail barang lab',
      data,
    };
  }

  @ApiOperation({
    summary: 'UPDATE — Perbarui data barang (misal pindah lemari atau update catatan)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID barang lab',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.itemsService.update(id, dto, req.user);
    return {
      statusCode: 200,
      message: 'Berhasil memperbarui data barang lab',
      data,
    };
  }

  @ApiOperation({
    summary: 'DELETE — Hapus barang dari inventaris lab berdasarkan UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID barang lab',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.itemsService.remove(id, req.user);
    return {
      statusCode: 200,
      message: 'Berhasil menghapus barang dari inventaris lab',
      data,
    };
  }
}
