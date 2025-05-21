import { Injectable, NotFoundException } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getTotalEmployees() {
    // const count = await this.dashboardRepository.getTotalEmployees();
    // if (count == 0) {
    //   throw new NotFoundException('No employees found');
    // }
    return await this.dashboardRepository.getTotalEmployees();
  }

  async getNewEmployeesThisMonth() {
    // const count = await this.dashboardRepository.getNewEmployeesThisMonth();
    // if (count == 0) {
    //   throw new NotFoundException('No employees found');
    // }
    return await this.dashboardRepository.getNewEmployeesThisMonth();
  }

  async getTotalCompanies() {
    // const count = await this.dashboardRepository.getTotalCompanies();
    // if (count == 0) {
    //   throw new NotFoundException('No companies found');
    // }
    return await this.dashboardRepository.getTotalCompanies();
  }

  async getNewCompaniesThisMonth() {
    // const count = await this.dashboardRepository.getNewCompaniesThisMonth();
    // if (count == 0) {
    //   throw new NotFoundException('No companies found');
    // }
    return await this.dashboardRepository.getNewCompaniesThisMonth();
  }
}
