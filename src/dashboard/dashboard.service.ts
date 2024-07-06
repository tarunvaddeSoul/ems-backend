import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getTotalEmployees(): Promise<number> {
    return this.dashboardRepository.getTotalEmployees();
  }

  async getNewEmployeesThisMonth(): Promise<number> {
    return this.dashboardRepository.getNewEmployeesThisMonth();
  }

  async getTotalCompanies(): Promise<number> {
    return this.dashboardRepository.getTotalCompanies();
  }

  async getNewCompaniesThisMonth(): Promise<number> {
    return this.dashboardRepository.getNewCompaniesThisMonth();
  }
}