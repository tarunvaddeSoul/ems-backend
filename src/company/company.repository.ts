import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompanyDto) {
    return this.prisma.company.create({ data });
  }

  async update(id: string, data: UpdateCompanyDto) {
    return this.prisma.company.update({ where: { id }, data });
  }

  async findById(id: string) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.company.findMany();
  }
}
