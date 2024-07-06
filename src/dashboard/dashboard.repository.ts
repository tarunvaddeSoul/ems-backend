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

    const formattedFirstDay = firstDayOfMonth.toISOString().split('T')[0];
    const formattedLastDay = lastDayOfMonth.toISOString().split('T')[0];

    return this.prisma.employee.count({
      where: {
        dateOfJoining: {
          gte: formattedFirstDay,
          lte: formattedLastDay,
        },
      },
    });
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