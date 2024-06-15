import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CalculateSalaryDto } from './dto/calculate-salary.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';

@Controller('salary')
@UseInterceptors(TransformInterceptor)
@ApiTags('Salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate Salary',
    description: 'Calculate the salary of an employee based on attendance',
  })
  async calculateSalary(
    @Body() calculateSalaryDto: CalculateSalaryDto,
  ): Promise<{ calculatedSalary: number }> {
    const { month } = calculateSalaryDto;
    const [year, monthIndex] = month.split('-').map(Number);
    const inputDate = new Date(year, monthIndex - 1);
    const currentDate = new Date();
    currentDate.setDate(1); // Set to the start of the current month for comparison

    if (inputDate > currentDate) {
      throw new BadRequestException('The month must not be in the future.');
    }
    const calculatedSalary = await this.salaryService.calculateSalary(
      calculateSalaryDto,
    );
    return { calculatedSalary };
  }
}
