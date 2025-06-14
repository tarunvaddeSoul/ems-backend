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
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    const formattedFirstDay =
      this.formatDateToComparableString(firstDayOfMonth);
    const formattedLastDay = this.formatDateToComparableString(lastDayOfMonth);

    const employeesInDateRange = await this.prisma.employee.findMany();
    if (employeesInDateRange.length == 0) {
      return 0;
    }

    const filteredEmployees = employeesInDateRange.filter((employee) => {
      const employeeDate = this.formatDateToComparableString(
        this.parseDate(employee.employeeOnboardingDate),
      );
      return (
        employeeDate >= formattedFirstDay && employeeDate <= formattedLastDay
      );
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
    const [day, month, year] = dateString
      .split('-')
      .map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

  async getTotalCompanies(): Promise<number> {
    return this.prisma.company.count();
  }

  async getNewCompaniesThisMonth(): Promise<number> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    return this.prisma.company.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
  }

  async getUpcomingBirthdays(daysAhead = 30): Promise<any[]> {
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + daysAhead);

    // Fetch all employees
    const employees = await this.prisma.employee.findMany();

    // Filter for birthdays in the next `daysAhead` days
    return employees.filter((emp) => {
      if (!emp.dateOfBirth) return false;
      // Assuming dateOfBirth is stored as 'YYYY-MM-DD' or 'DD-MM-YYYY'
      let [year, month, day] = [0, 0, 0];
      if (emp.dateOfBirth.includes('-')) {
        const parts = emp.dateOfBirth.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          year = parseInt(parts[0]);
          month = parseInt(parts[1]);
          day = parseInt(parts[2]);
        } else {
          // DD-MM-YYYY
          day = parseInt(parts[0]);
          month = parseInt(parts[1]);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          year = parseInt(parts[2]);
        }
      }
      const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
      return birthdayThisYear >= today && birthdayThisYear <= end;
    });
  }

  async getUpcomingAnniversaries(daysAhead = 30): Promise<any[]> {
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + daysAhead);

    // Fetch all employees
    const employees = await this.prisma.employee.findMany();

    // Filter for anniversaries in the next `daysAhead` days
    return employees.filter((emp) => {
      if (!emp.employeeOnboardingDate) return false;
      // Assuming employeeOnboardingDate is stored as 'YYYY-MM-DD' or 'DD-MM-YYYY'
      let [year, month, day] = [0, 0, 0];
      if (emp.employeeOnboardingDate.includes('-')) {
        const parts = emp.employeeOnboardingDate.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          year = parseInt(parts[0]);
          month = parseInt(parts[1]);
          day = parseInt(parts[2]);
        } else {
          // DD-MM-YYYY
          day = parseInt(parts[0]);
          month = parseInt(parts[1]);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          year = parseInt(parts[2]);
        }
      }
      const anniversaryThisYear = new Date(today.getFullYear(), month - 1, day);
      return anniversaryThisYear >= today && anniversaryThisYear <= end;
    });
  }

  // Employees by department
  async getEmployeesByDepartment() {
    return this.prisma.employmentHistory.groupBy({
      by: ['departmentName'],
      _count: { departmentName: true },
    });
  }

  // Employees by designation
  async getEmployeesByDesignation() {
    return this.prisma.employmentHistory.groupBy({
      by: ['designationName'],
      _count: { designationName: true },
    });
  }

  // Active vs inactive employees
  async getActiveInactiveCountsInEmployees() {
    const [active, inactive] = await Promise.all([
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.employee.count({ where: { status: 'INACTIVE' } }),
    ]);
    return { active, inactive };
  }

  async getActiveInactiveCountsInCompanies() {
    const [active, inactive] = await Promise.all([
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      this.prisma.company.count({ where: { status: 'INACTIVE' } }),
    ]);
    return { active, inactive };
  }

  // Recent joinees (by onboarding date)
  async getRecentJoinees(limit = 5) {
    return this.prisma.employee.findMany({
      orderBy: { employeeOnboardingDate: 'desc' },
      take: limit,
    });
  }

  // Recent payrolls (by createdAt)
  async getRecentPayrolls(limit = 5) {
    return this.prisma.salaryRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { employee: true, company: true },
    });
  }
}
