import { Injectable, Logger } from '@nestjs/common';
import { Attendance, SalaryRecord, SalaryTemplate } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PayrollRepository {
  private readonly logger = new Logger(PayrollRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get salary template for a company
   */
  async getSalaryTemplateByCompany(
    companyId: string,
  ): Promise<SalaryTemplate | null> {
    return this.prisma.salaryTemplate.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' }, // Get the latest template
    });
  }

  /**
   * Get attendance data for employees by month
   */
  async getAttendanceByMonth(
    employeeIds: string[],
    companyId: string,
    month: string,
  ): Promise<Attendance[]> {
    return this.prisma.attendance.findMany({
      where: {
        employeeId: { in: employeeIds },
        companyId,
        month,
      },
    });
  }

  async getPayrollRecords(params: {
    companyId?: string;
    employeeId?: string;
    startMonth?: string;
    endMonth?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const {
      companyId,
      employeeId,
      startMonth,
      endMonth,
      page,
      limit,
      sortBy,
      sortOrder,
    } = params;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (employeeId) where.employeeId = employeeId;
    if (startMonth || endMonth) {
      where.month = {};
      if (startMonth) where.month.gte = startMonth;
      if (endMonth) where.month.lte = endMonth;
    }

    const [records, total] = await Promise.all([
      this.prisma.salaryRecord.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.salaryRecord.count({ where }),
    ]);
    return { records, total };
  }

  /**
   * Save or update salary record with flexible JSON data
   */
  async saveSalaryRecord(
    employeeId: string,
    companyId: string,
    companyName: string,
    payrollMonth: string,
    salaryData: Record<string, any>,
  ): Promise<SalaryRecord> {
    try {
      // Use upsert to handle both create and update in one operation
      return await this.prisma.salaryRecord.upsert({
        where: {
          employeeId_companyId_month: {
            employeeId,
            companyId,
            month: payrollMonth,
          },
        },
        update: {
          salaryData,
        },
        create: {
          employeeId,
          companyId,
          companyName,
          month: payrollMonth,
          salaryData,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to save salary record: ${error.message}`);
      throw error;
    }
  }

  async getEmployeePayrollRecords(
    employeeId: string,
    companyId?: string,
    startMonth?: string,
    endMonth?: string,
  ) {
    const where: any = { employeeId };
    if (companyId) where.companyId = companyId;
    if (startMonth) where.payrollMonth = { gte: startMonth };
    if (endMonth) {
      where.payrollMonth = where.payrollMonth || {};
      where.payrollMonth.lte = endMonth;
    }
    return this.prisma.salaryRecord.findMany({
      where,
      orderBy: { month: 'desc' },
    });
  }

  /**
   * Get salary record for a specific employee, company, and month
   */
  async getSalaryRecord(
    employeeId: string,
    companyId: string,
    month: string,
  ): Promise<SalaryRecord | null> {
    return this.prisma.salaryRecord.findUnique({
      where: {
        employeeId_companyId_month: {
          employeeId,
          companyId,
          month,
        },
      },
      include: {
        employee: true,
        company: true,
      },
    });
  }

  /**
   * Get all salary records for a company for a specific month
   */
  async getCompanyPayrollByMonth(
    companyId: string,
    month: string,
  ): Promise<SalaryRecord[]> {
    return this.prisma.salaryRecord.findMany({
      where: {
        companyId,
        month,
      },
      include: {
        employee: true,
      },
      orderBy: {
        employee: {
          firstName: 'asc',
        },
      },
    });
  }

  /**
   * Get past payrolls for a company with pagination
   */
  async getPastPayrolls(
    companyId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    records: Array<{
      month: string;
      employeeCount: number;
      totalNetSalary: number;
      records: SalaryRecord[];
    }>;
    totalPages: number;
    currentPage: number;
  }> {
    // Get distinct months for the company
    const distinctMonths = await this.prisma.salaryRecord.findMany({
      where: { companyId },
      select: { month: true },
      distinct: ['month'],
      orderBy: { month: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const totalDistinctMonths = await this.prisma.salaryRecord.groupBy({
      by: ['month'],
      where: { companyId },
      _count: { month: true },
    });

    const records = await Promise.all(
      distinctMonths.map(async ({ month }) => {
        const monthRecords = await this.prisma.salaryRecord.findMany({
          where: { companyId, month },
          include: { employee: true },
        });

        // Calculate total net salary for the month
        const totalNetSalary = monthRecords.reduce((sum, record) => {
          let netSalary = 0;
          if (
            record.salaryData &&
            typeof record.salaryData === 'object' &&
            !Array.isArray(record.salaryData)
          ) {
            netSalary =
              ((record.salaryData as { netSalary?: unknown })
                .netSalary as number) ?? 0;
            if (typeof netSalary !== 'number') {
              netSalary = 0;
            }
          }
          return sum + netSalary;
        }, 0);

        return {
          month,
          employeeCount: monthRecords.length,
          totalNetSalary,
          records: monthRecords,
        };
      }),
    );

    return {
      records,
      totalPages: Math.ceil(totalDistinctMonths.length / limit),
      currentPage: page,
    };
  }

  /**
   * Get salary records for multiple employees and months
   */
  async getSalaryRecordsBatch(filters: {
    employeeIds?: string[];
    companyId: string;
    startMonth?: Date;
    endMonth?: Date;
  }): Promise<SalaryRecord[]> {
    const where: any = {
      companyId: filters.companyId,
    };

    if (filters.employeeIds?.length) {
      where.employeeId = { in: filters.employeeIds };
    }

    if (filters.startMonth || filters.endMonth) {
      where.month = {};
      if (filters.startMonth) {
        where.month.gte = filters.startMonth;
      }
      if (filters.endMonth) {
        where.month.lte = filters.endMonth;
      }
    }

    return this.prisma.salaryRecord.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: [{ month: 'desc' }, { employee: { firstName: 'asc' } }],
    });
  }

  /**
   * Delete salary record
   */
  async deleteSalaryRecord(
    employeeId: string,
    companyId: string,
    month: string,
  ): Promise<void> {
    await this.prisma.salaryRecord.delete({
      where: {
        employeeId_companyId_month: {
          employeeId,
          companyId,
          month,
        },
      },
    });
  }

  /**
   * Get salary statistics for a company
   */
  async getPayrollStats(
    companyId: string,
    startMonth?: Date,
    endMonth?: Date,
  ): Promise<{
    totalRecords: number;
    totalEmployees: number;
    monthsWithData: number;
    avgMonthlySalary: number;
  }> {
    const where: any = { companyId };

    if (startMonth || endMonth) {
      where.month = {};
      if (startMonth) where.month.gte = startMonth;
      if (endMonth) where.month.lte = endMonth;
    }

    const [totalRecords, distinctEmployees, distinctMonths, records] =
      await Promise.all([
        this.prisma.salaryRecord.count({ where }),
        this.prisma.salaryRecord.findMany({
          where,
          select: { employeeId: true },
          distinct: ['employeeId'],
        }),
        this.prisma.salaryRecord.findMany({
          where,
          select: { month: true },
          distinct: ['month'],
        }),
        this.prisma.salaryRecord.findMany({
          where,
          select: { salaryData: true },
        }),
      ]);

    // Calculate average monthly salary
    const totalSalary = records.reduce((sum, record) => {
      let netSalary = 0;
      if (
        record.salaryData &&
        typeof record.salaryData === 'object' &&
        !Array.isArray(record.salaryData)
      ) {
        // Type assertion to access netSalary if salaryData is an object
        netSalary =
          ((record.salaryData as { netSalary?: unknown })
            .netSalary as number) ?? 0;
        if (typeof netSalary !== 'number') {
          netSalary = 0;
        }
      }
      return sum + netSalary;
    }, 0);

    return {
      totalRecords,
      totalEmployees: distinctEmployees.length,
      monthsWithData: distinctMonths.length,
      avgMonthlySalary: totalRecords > 0 ? totalSalary / totalRecords : 0,
    };
  }
}
