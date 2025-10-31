import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class ListAttendanceQueryDto {
  @ApiPropertyOptional({
    type: 'string',
    description: 'Filter by company ID (UUID format)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Filter by employee ID',
    example: 'TSS9934',
  })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Filter by month in YYYY-MM format',
    example: '2025-10',
    pattern: '^\\d{4}-\\d{2}$',
  })
  @IsOptional()
  @Matches(/^(\d{4})-(0[1-9]|1[0-2])$/, {
    message: 'Month must be in YYYY-MM format (e.g., 2025-10)',
  })
  month?: string;
}
