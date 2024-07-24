import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { CreateCompanyDto } from './dto/create-company.dto';
// import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, EmploymentHistory, Prisma } from '@prisma/client';
import { GetAllCompaniesDto } from './dto/get-all-companies.dto';
import {
  CreateCompanyDto,
  SalaryTemplateDto,
  UpdateCompanyDto,
} from './dto/company.dto';
import { plainToClass } from 'class-transformer';

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
        salaryTemplates,
        status,
        companyOnboardingDate,
      } = data;

      const company = await this.prisma.company.create({
        data: {
          name,
          address,
          contactPersonName,
          contactPersonNumber,
          status,
          companyOnboardingDate,
          salaryTemplates: {
            create: {
              fields: salaryTemplates as any,
            },
          },
        },
        include: {
          salaryTemplates: true,
        },
      });

      return company;
    } catch (error) {
      // this.logger.error(`Error creating company: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    try {
      const { salaryTemplates, ...companyData } = data;

      const updatedCompany = await this.prisma.company.update({
        where: { id },
        data: {
          ...companyData,
          salaryTemplates: salaryTemplates
            ? {
                updateMany: {
                  where: {
                    companyId: id,
                  },
                  data: {
                    fields: salaryTemplates as any,
                  },
                },
              }
            : undefined,
        },
        include: {
          salaryTemplates: true,
        },
      });

      // If no salary template exists, create one
      if (salaryTemplates && updatedCompany.salaryTemplates.length === 0) {
        await this.prisma.salaryTemplate.create({
          data: {
            companyId: id,
            fields: salaryTemplates as any,
          },
        });

        // Fetch the company again to include the newly created salary template
        return await this.prisma.company.findUnique({
          where: { id },
          include: { salaryTemplates: true },
        });
      }

      return updatedCompany;
    } catch (error) {
      // this.logger.error(`Error updating company: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id },
        select: {
          name: true,
          address: true,
          contactPersonName: true,
          contactPersonNumber: true,
          status: true,
          companyOnboardingDate: true,
          salaryTemplates: { select: { fields: true } },
        },
      });
      return company;
    } catch (error) {
      throw error;
    }
  }

  async companyExists(name: string): Promise<boolean> {
    try {
      const company = await this.prisma.company.findFirst({ where: { name } });
      return !!company;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  async getCompanyWithEmployeeCount(): Promise<
    { name: string; employeeCount: number }[]
  > {
    try {
      const companies = await this.prisma.company.findMany({
        include: {
          _count: {
            select: { EmploymentHistory: true },
          },
        },
      });

      // Sort companies by employeeCount in descending order
      companies.sort((a, b) => {
        if (a._count?.EmploymentHistory && b._count?.EmploymentHistory) {
          return b._count.EmploymentHistory - a._count.EmploymentHistory; // Descending order
        } else {
          return 0; // Maintain current order
        }
      });

      return companies.map((company) => ({
        name: company.name,
        employeeCount: company._count?.EmploymentHistory || 0,
      }));
    } catch (error) {
      throw error;
    }
  }

  async getEmploymentHistory(companyId: string): Promise<EmploymentHistory[]> {
    try {
      const employmentHistory = await this.prisma.employmentHistory.findMany({
        where: { companyId },
        include: {
          employee: true,
          designation: true,
          department: true,
        },
      });
      return employmentHistory;
    } catch (error) {
      throw error;
    }
  }
}
