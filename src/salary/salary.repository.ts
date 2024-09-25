import { Injectable } from '@nestjs/common';
import { ISalary } from './interfaces/salary.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Salary } from '@prisma/client';

@Injectable()
export class SalaryRepository {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateSalary(data: Prisma.SalaryCreateInput): Promise<Salary> {
    try {
      const salary = await this.prisma.salary.upsert({
        where: {
          employeeId_companyId_month: {
            employeeId: data.employee.connect!.id,
            companyId: data.company.connect!.id,
            month: data.month,
          },
        },
        update: {
          monthlySalary: data.monthlySalary,
          dutyDone: data.dutyDone,
          wagesPerDay: data.wagesPerDay,
          basicPay: data.basicPay,
          epfWages: data.epfWages,
          bonus: data.bonus,
          grossSalary: data.grossSalary,
          pf: data.pf,
          esic: data.esic,
          advance: data.advance,
          uniform: data.uniform,
          penalty: data.penalty,
          lwf: data.lwf,
          otherDeductions: data.otherDeductions,
          otherDeductionsRemark: data.otherDeductionsRemark,
          allowance: data.allowance,
          allowanceRemark: data.allowanceRemark,
          totalDeductions: data.totalDeductions,
          netSalary: data.netSalary,
        },
        create: data,
      });

      return salary;
    } catch (error) {
      console.error('Error in createOrUpdateSalary:', error);
      throw error;
    }
  }

  // async createOrUpdateSalary(data: Prisma.SalaryCreateInput): Promise<Salary> {
  //   const { employee, company, ...salaryData } = data;

  //   return this.prisma.salary.upsert({
  //     where: {
  //       employeeId_companyId_month: {
  //         employeeId: employee.connect!.id,
  //         companyId: company.connect!.id,
  //         month: data.month,
  //       },
  //     },
  //     update: salaryData,
  //     create: data,
  //   });
  // }

  async getSalariesByCompanyAndMonth(companyId: string, month: string) {
    return this.prisma.salary.findMany({
      where: {
        companyId,
        month,
      },
      include: {
        employee: true,
      },
    });
  }
}
