// src/salary/dto/calculate-salary.dto.ts
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsMonthYear } from 'src/common/validators/is-month-year';

export class CalculateSalaryDto {
  @ApiProperty({
    description: 'ID of the company',
    example: 'company123'
  })
  @IsString()
  companyId: string;

  @ApiProperty({
    description: 'Month and year for which the salary is being calculated',
    example: '07-2024'
  })
  @IsMonthYear()
  month: string; // Format: MM-YYYY

  @ApiProperty({
    description: 'ID of the employee',
    example: 'employee456'
  })
  @IsString()
  employeeId: string;

  @ApiProperty({
    description: 'Number of duties done by the employee',
    example: 25,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  dutyDone: number;

  @ApiProperty({
    description: 'Advance payment made to the employee',
    example: 1000,
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  advance?: number;

  @ApiProperty({
    description: 'Uniform charges for the employee',
    example: 200,
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  uniform?: number;

  @ApiProperty({
    description: 'Penalty charges for the employee',
    example: 100,
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  penalty?: number;

  @ApiProperty({
    description: 'Other deductions for the employee',
    example: 50,
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  otherDeductions?: number;

  @ApiProperty({
    description: 'Remarks for other deductions',
    example: 'Late fee',
    required: false
  })
  @IsString()
  @IsOptional()
  otherDeductionsRemark?: string;

  @ApiProperty({
    description: 'Allowances for the employee',
    example: 500,
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  allowance?: number;

  @ApiProperty({
    description: 'Remarks for allowances',
    example: 'Performance bonus',
    required: false
  })
  @IsString()
  @IsOptional()
  allowanceRemark?: string;
}
