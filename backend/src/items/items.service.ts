import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Division, LabItem } from '../../prisma/generated/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthUser } from '../auth/jwt-auth.guard.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateItemDto, user: AuthUser): Promise<LabItem> {
    // Anggota otomatis menyimpan untuk divisinya sendiri; Pengurus bisa pilih divisi
    const targetDivision: Division =
      user.role === 'PENGURUS' && dto.division
        ? (dto.division as Division)
        : (user.division as Division);

    return this.prisma.labItem.create({
      data: {
        itemName: dto.itemName.trim(),
        storagePlace: dto.storagePlace.trim(),
        memberName: user.fullName,
        division: targetDivision,
        note: dto.note.trim(),
        evidenceImage: dto.evidenceImage ?? null,
        location: dto.location.trim(),
        userId: user.sub,
      },
    });
  }

  async findAll(
    user: AuthUser,
    division?: string,
    search?: string,
  ): Promise<LabItem[]> {
    const validDivisions = ['AUV', 'ROV', 'KRSTI', 'KKI'];

    // Role ANGGOTA dipaksa hanya melihat barang divisinya sendiri
    let divisionFilter: Division | undefined;
    if (user.role === 'PENGURUS') {
      if (division && validDivisions.includes(division.toUpperCase())) {
        divisionFilter = division.toUpperCase() as Division;
      }
    } else {
      divisionFilter = user.division as Division;
    }

    return this.prisma.labItem.findMany({
      where: {
        ...(divisionFilter ? { division: divisionFilter } : {}),
        ...(search
          ? {
              OR: [
                { itemName: { contains: search, mode: 'insensitive' } },
                { storagePlace: { contains: search, mode: 'insensitive' } },
                { memberName: { contains: search, mode: 'insensitive' } },
                { note: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { storedAt: 'desc' },
    });
  }

  async findOne(id: string, user: AuthUser): Promise<LabItem> {
    const item = await this.prisma.labItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Barang dengan id ${id} tidak ditemukan`);
    }
    if (user.role !== 'PENGURUS' && item.division !== user.division) {
      throw new ForbiddenException(
        'Anda hanya dapat mengakses barang milik divisi Anda sendiri',
      );
    }
    return item;
  }

  async update(
    id: string,
    dto: UpdateItemDto,
    user: AuthUser,
  ): Promise<LabItem> {
    await this.findOne(id, user);

    return this.prisma.labItem.update({
      where: { id },
      data: {
        ...(dto.itemName !== undefined ? { itemName: dto.itemName.trim() } : {}),
        ...(dto.storagePlace !== undefined
          ? { storagePlace: dto.storagePlace.trim() }
          : {}),
        ...(user.role === 'PENGURUS' && dto.division !== undefined
          ? { division: dto.division as Division }
          : {}),
        ...(dto.note !== undefined ? { note: dto.note.trim() } : {}),
        ...(dto.evidenceImage !== undefined
          ? { evidenceImage: dto.evidenceImage }
          : {}),
        ...(dto.location !== undefined ? { location: dto.location.trim() } : {}),
      },
    });
  }

  async remove(id: string, user: AuthUser): Promise<LabItem> {
    await this.findOne(id, user);
    return this.prisma.labItem.delete({ where: { id } });
  }

  async getStats(user: AuthUser) {
    if (user.role === 'PENGURUS') {
      const totalItems = await this.prisma.labItem.count();
      const grouped = await this.prisma.labItem.groupBy({
        by: ['division'],
        _count: { id: true },
      });

      const divisions = ['AUV', 'ROV', 'KRSTI', 'KKI'] as const;
      return {
        scope: 'ALL',
        totalItems,
        byDivision: divisions.map((div) => {
          const found = grouped.find((g) => g.division === div);
          return { division: div, count: found ? found._count.id : 0 };
        }),
      };
    }

    const totalItems = await this.prisma.labItem.count({
      where: { division: user.division as Division },
    });

    return {
      scope: user.division,
      totalItems,
      byDivision: [{ division: user.division, count: totalItems }],
    };
  }
}
