import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';

@Controller('dashboard')
@ApiTags('Dashboard')
@UseInterceptors(TransformInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData() {
    const totalEmployees = await this.dashboardService.getTotalEmployees();
    const newEmployeesThisMonth =
      await this.dashboardService.getNewEmployeesThisMonth();
    const totalCompanies = await this.dashboardService.getTotalCompanies();
    const newCompaniesThisMonth =
      await this.dashboardService.getNewCompaniesThisMonth();

    return {
      message: 'Dashboard data fetched successfully!',
      data: {
        totalEmployees,
        newEmployeesThisMonth,
        totalCompanies,
        newCompaniesThisMonth,
      },
    };
  }
}
