import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust the import path as needed

@Injectable()
export class DashboardRepository {
  constructor(private prisma: PrismaService) {}

  async getTotalEmployees(): Promise<number> {
    return this.prisma.employee.count();
  }

  async getNewEmployeesThisMonth(): Promise<number> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formattedFirstDay = this.formatDateToComparableString(firstDayOfMonth);
    const formattedLastDay = this.formatDateToComparableString(lastDayOfMonth);

    const employeesInDateRange = await this.prisma.employee.findMany();
    if (employeesInDateRange.length == 0) {
      return 0;
    }
    
    const filteredEmployees = employeesInDateRange.filter(employee => {
      const employeeDate = this.formatDateToComparableString(this.parseDate(employee.employeeOnboardingDate));
      return employeeDate >= formattedFirstDay && employeeDate <= formattedLastDay;
    });

    return filteredEmployees.length;
  }

  private formatDateToComparableString(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  private parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('-').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

  async getTotalCompanies(): Promise<number> {
    return this.prisma.company.count();
  }

  async getNewCompaniesThisMonth(): Promise<number> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.prisma.company.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
  }
}