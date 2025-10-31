import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsString, Matches } from 'class-validator';

export class GetAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'Employee ID',
    example: 'TSS9934',
    required: true,
  })
  employeeId: string;

  @ApiProperty({
    type: 'string',
    description: 'Month in YYYY-MM format',
    example: '2025-10',
    required: true,
    pattern: '^\\d{4}-\\d{2}$',
  })
  @IsNotEmpty()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM',
  })
  month: string; // Format: YYYY-MM
}

export class GetAttendanceByCompanyAndMonthDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'Company ID (UUID format)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
    required: true,
  })
  companyId: string;

  @ApiProperty({
    type: 'string',
    description: 'Month in YYYY-MM format',
    example: '2025-10',
    required: true,
    pattern: '^\\d{4}-\\d{2}$',
  })
  @IsNotEmpty()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM',
  })
  month: string; // Format: YYYY-MM
}
