import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '@prisma/client';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompanyDto): Promise<Company> {
    try {
      const company = await this.prisma.company.create({ data });
      return company;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    try {
      const company = await this.prisma.company.update({ where: { id }, data });
      return company;
    } catch (error) {
      return error;
    }
  }

  async findById(id: string): Promise<Company> {
    try {
      const company = await this.prisma.company.findUnique({ where: { id } });
      return company;
    } catch (error) {
      return error;
    }
  }

  async companyExists(name: string): Promise<boolean> {
    try {
      const company = await this.prisma.company.findFirst({ where: { name } });
      if (company) {
        return true;
      }
      return false;
    } catch (error) {
      return error;
    }
  }

  async findAll(): Promise<Company[]> {
    try {
      const companies = await this.prisma.company.findMany();
      return companies;
    } catch (error) {
      return error;
    }
  }

  async deleteCompany(id: string) {
    try {
      const deletedResponse = await this.prisma.company.delete({
        where: { id },
      });
      return deletedResponse;
    } catch (error) {
      return error;
    }
  }
}
