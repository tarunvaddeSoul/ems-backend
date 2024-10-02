import { Controller, Post, Body, Get, Param, UseInterceptors } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CalculateSalaryDto } from './dto/calculate-salary.dto';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';

@Controller('salary')
@ApiTags('Salary')
@UseInterceptors(TransformInterceptor)
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