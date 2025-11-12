import { Controller, Get, Query, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';

@Controller('dashboard')
@ApiTags('Dashboard')
@UseInterceptors(TransformInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get dashboard report',
    description: 'Retrieves comprehensive dashboard statistics including employee stats, company stats, growth metrics, special dates (birthdays, employee/company anniversaries), and recent activity. Includes data suitable for graphical representation.',
  })
  @ApiQuery({
    name: 'daysAhead',
    required: false,
    type: Number,
    example: 30,
    description: 'Number of days ahead to fetch birthdays and anniversaries (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard report retrieved successfully',
    type: ApiResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Dashboard report fetched successfully!',
        data: {
          summary: {
            totalEmployees: 150,
            newEmployeesThisMonth: 5,
            totalCompanies: 10,
            newCompaniesThisMonth: 2,
            activeEmployees: 140,
            inactiveEmployees: 10,
            activeCompanies: 8,
            inactiveCompanies: 2,
          },
          employeeStats: {
            total: 150,
            newThisMonth: 5,
            byDepartment: [{ departmentName: 'Engineering', _count: { departmentName: 50 } }],
            byDesignation: [{ designationName: 'Developer', _count: { designationName: 30 } }],
            activeInactive: { active: 140, inactive: 10 },
          },
          companyStats: {
            total: 10,
            newThisMonth: 2,
            activeInactive: { active: 8, inactive: 2 },
            tenure: {
              tenureDistribution: {
                '0-6 months': 2,
                '6-12 months': 3,
                '1-2 years': 3,
                '2-5 years': 1,
                '5+ years': 1,
              },
              averageTenureMonths: 18.5,
              averageTenureYears: 1.54,
              companies: [
                {
                  id: 'company-id',
                  name: 'ACME Corp',
                  status: 'ACTIVE',
                  monthsWithUs: 24,
                  yearsWithUs: 2.0,
                  tenureGroup: '2-5 years',
                  onboardingDate: '15-05-2022',
                },
              ],
            },
          },
          growthMetrics: {
            employees: {
              monthly: [
                { month: '2024-01', count: 120, newEmployees: 5 },
                { month: '2024-02', count: 125, newEmployees: 5 },
              ],
              yearly: [
                { year: 2020, count: 50, newEmployees: 10 },
                { year: 2021, count: 80, newEmployees: 30 },
              ],
            },
            companies: {
              monthly: [
                { month: '2024-01', count: 8, newCompanies: 1 },
                { month: '2024-02', count: 9, newCompanies: 1 },
              ],
              yearly: [
                { year: 2020, count: 3, newCompanies: 3 },
                { year: 2021, count: 5, newCompanies: 2 },
              ],
            },
          },
          specialDates: {
            birthdays: [],
            employeeAnniversaries: [],
            companyAnniversaries: [],
          },
          recentActivity: {
            recentJoinees: [],
            recentPayrolls: [],
          },
        },
      },
    },
  })
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
      companyAnniversaries,
      recentJoinees,
      recentPayrolls,
      employeeGrowthMonthly,
      companyGrowthMonthly,
      employeeGrowthYearly,
      companyGrowthYearly,
      companyTenureInfo,
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
      this.dashboardService.getUpcomingCompanyAnniversaries(daysAhead ?? 30),
      this.dashboardService.getRecentJoinees(5),
      this.dashboardService.getRecentPayrolls(5),
      this.dashboardService.getEmployeeGrowthOverTime(12),
      this.dashboardService.getCompanyGrowthOverTime(12),
      this.dashboardService.getEmployeeGrowthByYear(5),
      this.dashboardService.getCompanyGrowthByYear(5),
      this.dashboardService.getCompanyTenureInfo(),
    ]);

    return {
      message: 'Dashboard report fetched successfully!',
      data: {
        // Summary Statistics
        summary: {
          totalEmployees,
          newEmployeesThisMonth,
          totalCompanies,
          newCompaniesThisMonth,
          activeEmployees: activeInactiveEmployees.active,
          inactiveEmployees: activeInactiveEmployees.inactive,
          activeCompanies: activeInactiveCompanies.active,
          inactiveCompanies: activeInactiveCompanies.inactive,
        },
        // Employee Statistics
        employeeStats: {
          total: totalEmployees,
          newThisMonth: newEmployeesThisMonth,
          byDepartment: employeesByDepartment,
          byDesignation: employeesByDesignation,
          activeInactive: activeInactiveEmployees,
        },
        // Company Statistics
        companyStats: {
          total: totalCompanies,
          newThisMonth: newCompaniesThisMonth,
          activeInactive: activeInactiveCompanies,
          tenure: companyTenureInfo,
        },
        // Growth Metrics (for charts)
        growthMetrics: {
          employees: {
            monthly: employeeGrowthMonthly,
            yearly: employeeGrowthYearly,
          },
          companies: {
            monthly: companyGrowthMonthly,
            yearly: companyGrowthYearly,
          },
        },
        // Special Dates
        specialDates: {
          birthdays,
          employeeAnniversaries: anniversaries,
          companyAnniversaries,
        },
        // Recent Activity
        recentActivity: {
          recentJoinees,
          recentPayrolls,
        },
      },
    };
  }
}
