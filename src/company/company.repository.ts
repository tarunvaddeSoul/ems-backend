import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, Prisma } from '@prisma/client';
import { GetAllCompaniesDto } from './dto/get-all-companies.dto';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompanyDto): Promise<Company> {
    try {
      const {
        name,
        address,
        contactPersonName,
        contactPersonNumber,
        presentDaysCount,
        ESIC,
        PF,
        BONUS,
        LWF,
        otherAllowance,
        otherAllowanceRemark,
      } = data;
      const company = await this.prisma.company.create({
        data: {
          name,
          address,
          contactPersonName,
          contactPersonNumber,
          presentDaysCount,
          ESIC,
          PF,
          BONUS,
          LWF,
          otherAllowance,
          otherAllowanceRemark,
        },
      });
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

  async findAll(query: GetAllCompaniesDto): Promise<{
    companies: Company[];
    total: number;
  }> {
    try {
      const { page, limit, sortBy, sortOrder, searchText } = query;
      const skip = (page - 1) * limit;

      const where: Prisma.CompanyWhereInput = searchText
        ? {
            OR: [
              { name: { contains: searchText, mode: 'insensitive' } },
              { address: { contains: searchText, mode: 'insensitive' } },
              {
                contactPersonName: {
                  contains: searchText,
                  mode: 'insensitive',
                },
              },
              {
                contactPersonNumber: {
                  contains: searchText,
                  mode: 'insensitive',
                },
              },
              {
                presentDaysCount: { contains: searchText, mode: 'insensitive' },
              },
              { ESIC: { contains: searchText, mode: 'insensitive' } },
              { PF: { contains: searchText, mode: 'insensitive' } },
              { BONUS: { contains: searchText, mode: 'insensitive' } },
              { LWF: { contains: searchText, mode: 'insensitive' } },
              {
                otherAllowanceRemark: {
                  contains: searchText,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {};

      const companies = await this.prisma.company.findMany({
        skip,
        take: limit,
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      const total = await this.prisma.company.count({ where });
      return { companies, total };
    } catch (error) {
      throw error;
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
