import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  IsInt,
  Min,
  Max,
  IsIn,
  ValidateIf,
} from 'class-validator';

export class ListAttendanceSheetsDto {
  @ApiPropertyOptional({ type: 'string', description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Filter by specific month (YYYY-MM format)',
    example: '2025-10',
  })
  @IsOptional()
  @Matches(/^(\d{4})-(0[1-9]|1[0-2])$/, {
    message: 'month must be in YYYY-MM format',
  })
  @ValidateIf((o) => !o.startMonth && !o.endMonth)
  month?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Start of month range filter (YYYY-MM format)',
    example: '2025-01',
  })
  @IsOptional()
  @Matches(/^(\d{4})-(0[1-9]|1[0-2])$/, {
    message: 'startMonth must be in YYYY-MM format',
  })
  @ValidateIf((o) => !o.month)
  startMonth?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'End of month range filter (YYYY-MM format)',
    example: '2025-12',
  })
  @IsOptional()
  @Matches(/^(\d{4})-(0[1-9]|1[0-2])$/, {
    message: 'endMonth must be in YYYY-MM format',
  })
  @ValidateIf((o) => !o.month)
  endMonth?: string;

  @ApiPropertyOptional({
    type: 'number',
    description: 'Page number (default: 1)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    type: 'number',
    description: 'Items per page (default: 20, max: 100)',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Sort field',
    enum: ['month', 'companyId', 'createdAt'],
    default: 'month',
  })
  @IsOptional()
  @IsIn(['month', 'companyId', 'createdAt'])
  sortBy?: string = 'month';

  @ApiPropertyOptional({
    type: 'string',
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
