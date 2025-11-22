import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { SalaryCategory, SalarySubCategory } from '@prisma/client';

export class CreateSalaryRateScheduleDto {
  @ApiProperty({
    enum: SalaryCategory,
    description: 'Salary category (CENTRAL, STATE, SPECIALIZED)',
    example: SalaryCategory.CENTRAL,
  })
  @IsNotEmpty()
  @IsEnum(SalaryCategory)
  category: SalaryCategory;

  @ApiProperty({
    enum: SalarySubCategory,
    description:
      'Salary sub-category (SKILLED, UNSKILLED, HIGHSKILLED, SEMISKILLED)',
    example: SalarySubCategory.SKILLED,
  })
  @IsNotEmpty()
  @IsEnum(SalarySubCategory)
  subCategory: SalarySubCategory;

  @ApiProperty({
    description: 'Rate per day in rupees',
    example: 893,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  ratePerDay: number;

  @ApiProperty({
    description: 'Effective from date (ISO 8601 format)',
    example: '2024-04-01T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  effectiveFrom: string;

  @ApiProperty({
    description:
      'Effective to date (ISO 8601 format). Optional - null means ongoing',
    example: '2024-09-30T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiProperty({
    description: 'Whether this rate schedule is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
