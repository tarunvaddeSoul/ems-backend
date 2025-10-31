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
    description: 'Retrieves comprehensive dashboard statistics including employee stats, company stats, special dates (birthdays, anniversaries), and recent activity',
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
          employeeStats: {
            totalEmployees: 150,
            newEmployeesThisMonth: 5,
            employeesByDepartment: [{ department: 'Engineering', count: 50 }],
            employeesByDesignation: [{ designation: 'Developer', count: 30 }],
            activeInactive: { active: 140, inactive: 10 },
          },
          companyStats: {
            totalCompanies: 10,
            newCompaniesThisMonth: 2,
            activeInactive: { active: 8, inactive: 2 },
          },
          specialDates: {
            birthdays: [],
            anniversaries: [],
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
