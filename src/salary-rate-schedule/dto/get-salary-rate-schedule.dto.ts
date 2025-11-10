import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SalaryCategory, SalarySubCategory } from '@prisma/client';

export class GetSalaryRateScheduleDto {
  @ApiPropertyOptional({
    enum: SalaryCategory,
    description: 'Filter by salary category',
    example: SalaryCategory.CENTRAL,
  })
  @IsOptional()
  @IsEnum(SalaryCategory)
  category?: SalaryCategory;

  @ApiPropertyOptional({
    enum: SalarySubCategory,
    description: 'Filter by salary sub-category',
    example: SalarySubCategory.SKILLED,
  })
  @IsOptional()
  @IsEnum(SalarySubCategory)
  subCategory?: SalarySubCategory;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

