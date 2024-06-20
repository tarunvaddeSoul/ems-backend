import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DesignationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.designation.create({
      data: { name },
    });
  }

  async getById(id: string) {
    return this.prisma.designation.findUnique({
      where: { id },
    });
  }

  async getByName(name: string) {
    return this.prisma.designation.findUnique({
      where: { name },
    });
  }

  async getAll() {
    return this.prisma.designation.findMany();
  }

  async deleteById(id: string) {
    return this.prisma.designation.delete({
      where: { id },
    });
  }

  async deleteByName(name: string) {
    return this.prisma.designation.delete({
      where: { name },
    });
  }
}
