// src/salary/salary.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CalculateSalaryDto } from './dto/calculate-salary.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('salary')
@ApiTags('Salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post('calculate')
  async calculateSalary(@Body() calculateSalaryDto: CalculateSalaryDto) {
    return this.salaryService.calculateSalary(calculateSalaryDto);
  }

  @Get('company/:companyId/month/:month')
  async getSalariesByCompanyAndMonth(
    @Param('companyId') companyId: string,
    @Param('month') month: string
  ) {
    return this.salaryService.getSalariesByCompanyAndMonth(companyId, month);
  }
}