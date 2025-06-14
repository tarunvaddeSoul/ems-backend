import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PayrollRecordDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ description: 'Salary calculation object' })
  @IsNotEmpty()
  salary: Record<string, any>;
}

export class FinalizePayrollDto {
  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @ApiProperty({
    type: 'string',
    description: 'Payroll month in the format YYYY-MM',
    example: '2024-06',
    required: true,
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM',
  })
  payrollMonth: string;

  @ApiProperty({
    type: [PayrollRecordDto],
    description: 'Array of payroll records to finalize',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayrollRecordDto)
  payrollRecords: PayrollRecordDto[];
}
