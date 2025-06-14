import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';

@Controller('dashboard')
@ApiTags('Dashboard')
@UseInterceptors(TransformInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('report')
  @ApiQuery({ name: 'daysAhead', required: false, type: Number, example: 30 })
  async getDashboardReport(@Query('daysAhead') daysAhead?: number) {
    const [
      totalEmployees,
      newEmployeesThisMonth,
      employeesByDepartment,
      employeesByDesignation,
      activeInactiveEmployees,
      activeInactiveCompanies,
      totalCompanies,
      newCompaniesThisMonth,
      birthdays,
      anniversaries,
      recentJoinees,
      recentPayrolls,
    ] = await Promise.all([
      this.dashboardService.getTotalEmployees(),
      this.dashboardService.getNewEmployeesThisMonth(),
      this.dashboardService.getEmployeesByDepartment(),
      this.dashboardService.getEmployeesByDesignation(),
      this.dashboardService.getActiveInactiveCountsInEmployees(),
      this.dashboardService.getActiveInactiveCountsInCompanies(),
      this.dashboardService.getTotalCompanies(),
      this.dashboardService.getNewCompaniesThisMonth(),
      this.dashboardService.getUpcomingBirthdays(daysAhead ?? 30),
      this.dashboardService.getUpcomingAnniversaries(daysAhead ?? 30),
      this.dashboardService.getRecentJoinees(5),
      this.dashboardService.getRecentPayrolls(5),
    ]);

    return {
      message: 'Dashboard report fetched successfully!',
      data: {
        employeeStats: {
          totalEmployees,
          newEmployeesThisMonth,
          employeesByDepartment,
          employeesByDesignation,
          activeInactive: activeInactiveEmployees,
        },
        companyStats: {
          totalCompanies,
          newCompaniesThisMonth,
          activeInactive: activeInactiveCompanies,
        },
        specialDates: {
          birthdays,
          anniversaries,
        },
        recentActivity: {
          recentJoinees,
          recentPayrolls,
        },
      },
    };
  }
}
