import { Injectable } from '@nestjs/common';
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

  async getUpcomingBirthdays(daysAhead = 30) {
    return await this.dashboardRepository.getUpcomingBirthdays(daysAhead);
  }

  async getUpcomingAnniversaries(daysAhead = 30) {
    return await this.dashboardRepository.getUpcomingAnniversaries(daysAhead);
  }

  async getEmployeesByDepartment() {
    return await this.dashboardRepository.getEmployeesByDepartment();
  }

  async getEmployeesByDesignation() {
    return await this.dashboardRepository.getEmployeesByDesignation();
  }

  async getActiveInactiveCountsInEmployees() {
    return await this.dashboardRepository.getActiveInactiveCountsInEmployees();
  }
  async getActiveInactiveCountsInCompanies() {
    return await this.dashboardRepository.getActiveInactiveCountsInCompanies();
  }

  async getRecentJoinees(limit = 5) {
    return await this.dashboardRepository.getRecentJoinees(limit);
  }

  async getRecentPayrolls(limit = 5) {
    return await this.dashboardRepository.getRecentPayrolls(limit);
  }
}
