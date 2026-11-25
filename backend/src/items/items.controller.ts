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
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../auth/jwt-auth.guard.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { ItemsService } from './items.service.js';

@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

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

  @Get('stats')
  async getStats(@Req() req: AuthenticatedRequest) {
    const data = await this.itemsService.getStats(req.user);
    return {
      statusCode: 200,
      message: 'Berhasil mengambil statistik inventaris lab',
      data,
    };
  }

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
