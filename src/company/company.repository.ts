import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Company, EmploymentHistory, Prisma } from '@prisma/client';
import { GetAllCompaniesDto } from './dto/get-all-companies.dto';
import { UpdateCompanyDto } from './dto/company.dto';
import { GetEmployeesResponseDto } from './dto/get-employees-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { name: name.trim().toUpperCase() },
    });
  }

  async findByContactNumber(contactNumber: string): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { contactPersonNumber: contactNumber },
    });
  }

  async create(data: CreateCompanyDto): Promise<Company> {
    const {
      name,
      address,
      contactPersonName,
      contactPersonNumber,
      status,
      companyOnboardingDate,
      salaryTemplates,
    } = data;

    return await this.prisma.$transaction(async (prisma) => {
      // Create the company
      const company = await prisma.company.create({
        data: {
          name,
          address,
          contactPersonName,
          contactPersonNumber,
          status,
          companyOnboardingDate,
        },
      });

      // Create the salary template with structured configuration
      await prisma.salaryTemplate.create({
        data: {
          companyId: company.id,
          mandatoryFields: this.sanitizeJsonData(
            salaryTemplates.mandatoryFields,
          ),
          optionalFields: this.sanitizeJsonData(salaryTemplates.optionalFields),
          customFields: this.sanitizeJsonData(
            salaryTemplates.customFields || [],
          ),
        },
      });

      // Return the company with its salary template
      return prisma.company.findUnique({
        where: { id: company.id },
        include: {
          salaryTemplates: true,
        },
      });
    });
  }

  private sanitizeJsonData(data: any): any {
    // Convert any special types to plain objects for JSON storage
    return JSON.parse(JSON.stringify(data));
  }

  // async update(id: string, data: UpdateCompanyDto): Promise<Company> {
  //   const { salaryTemplates, ...companyData } = data;

  //   const updatedCompany = await this.prisma.company.update({
  //     where: { id },
  //     data: {
  //       ...companyData,
  //       salaryTemplates: salaryTemplates
  //         ? {
  //             updateMany: {
  //               where: {
  //                 companyId: id,
  //               },
  //               data: {
  //                 fields: salaryTemplates as any,
  //               },
  //             },
  //           }
  //         : undefined,
  //     },
  //     include: {
  //       salaryTemplates: true,
  //     },
  //   });

  //   // If no salary template exists, create one
  //   if (salaryTemplates && updatedCompany.salaryTemplates.length === 0) {
  //     await this.prisma.salaryTemplate.create({
  //       data: {
  //         companyId: id,
  //         fields: salaryTemplates as any,
  //       },
  //     });

  //     // Fetch the company again to include the newly created salary template
  //     return await this.prisma.company.findUnique({
  //       where: { id },
  //       include: { salaryTemplates: true },
  //     });
  //   }

  //   return updatedCompany;
  // }

  async findById(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        salaryTemplates: true,
      },
    });
  }

  async getSalaryTemplate(companyId: string) {
    return this.prisma.salaryTemplate.findFirst({
      where: { companyId },
    });
  }

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    // Destructure salaryTemplateConfig if present
    const { salaryTemplates, ...companyData } = data;

    // Update the company basic info
    await this.prisma.company.update({
      where: { id },
      data: companyData,
    });

    // If salaryTemplateConfig is provided, update the related salaryTemplate
    if (salaryTemplates) {
      await this.prisma.salaryTemplate.updateMany({
        where: { companyId: id },
        data: {
          mandatoryFields: this.sanitizeJsonData(
            salaryTemplates.mandatoryFields,
          ),
          optionalFields: this.sanitizeJsonData(salaryTemplates.optionalFields),
          customFields: this.sanitizeJsonData(
            salaryTemplates.customFields || [],
          ),
        },
      });
    }

    // Return the updated company with salaryTemplates
    return this.prisma.company.findUnique({
      where: { id },
      include: { salaryTemplates: true },
    });
  }

  async companyExists(name: string): Promise<boolean> {
    try {
      const company = await this.prisma.company.findFirst({ where: { name } });
      return !!company;
    } catch (error) {
      throw error;
    }
  }

  async getEmployeesInACompany(
    companyId: string,
  ): Promise<GetEmployeesResponseDto[]> {
    const employees = await this.prisma.employmentHistory.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,
        employeeId: true,
        status: true,
        employee: {
          select: {
            title: true,
            firstName: true,
            lastName: true,
            id: true,
          },
        },
        designation: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        salary: true,
        joiningDate: true,
        leavingDate: true,
      },
    });

    return employees.map((employee) => ({
      id: employee.id,
      employeeId: employee.employeeId,
      status: employee.status,
      title: employee.employee.title,
      firstName: employee.employee.firstName,
      lastName: employee.employee.lastName,
      designation: employee.designation.name,
      department: employee.department.name,
      salary: employee.salary,
      joiningDate: employee.joiningDate,
      leavingDate: employee.leavingDate,
    }));
  }

  async findAll(query: GetAllCompaniesDto): Promise<{
    companies: Company[];
    total: number;
  }> {
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
      include: {
        salaryTemplates: true,
      },
    });

    const total = await this.prisma.company.count({ where });
    return { companies, total };
  }

  async deleteCompany(id: string): Promise<Company> {
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
