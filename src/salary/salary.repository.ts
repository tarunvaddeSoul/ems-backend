import { Injectable } from '@nestjs/common';
import { ISalary } from './interfaces/salary.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalaryRepository {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateSalary(data: ISalary) {
    try {
      const salary = await this.prisma.salary.upsert({
        where: {
          employeeId_companyId_month: {
            employeeId: data.employeeId,
            companyId: data.companyId,
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
          advance: data.advance || 0,
          uniform: data.uniform || 0,
          penalty: data.penalty || 0,
          lwf: data.lwf,
          otherDeductions: data.otherDeductions || 0,
          otherDeductionsRemark: data.otherDeductionsRemark,
          allowance: data.allowance || 0,
          allowanceRemark: data.allowanceRemark,
          totalDeductions: data.totalDeductions,
          netSalary: data.netSalary,
        },
        create: {
          employeeId: data.employeeId,
          companyId: data.companyId,
          month: data.month,
          monthlySalary: data.monthlySalary,
          dutyDone: data.dutyDone,
          wagesPerDay: data.wagesPerDay,
          basicPay: data.basicPay,
          epfWages: data.epfWages,
          bonus: data.bonus,
          grossSalary: data.grossSalary,
          pf: data.pf,
          esic: data.esic,
          advance: data.advance || 0,
          uniform: data.uniform || 0,
          penalty: data.penalty || 0,
          lwf: data.lwf,
          otherDeductions: data.otherDeductions || 0,
          otherDeductionsRemark: data.otherDeductionsRemark,
          allowance: data.allowance || 0,
          allowanceRemark: data.allowanceRemark,
          totalDeductions: data.totalDeductions,
          netSalary: data.netSalary,
        },
      });
      return salary;
    } catch (error) {
      throw error; // It's better to throw the error for proper error handling
    }
  }

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
