import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class ListAttendanceQueryDto {
  @ApiPropertyOptional({ type: 'string', description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by employee ID' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Filter by month YYYY-MM', example: '2025-10' })
  @IsOptional()
  @Matches(/^(\d{4})-(0[1-9]|1[0-2])$/)
  month?: string;
}
