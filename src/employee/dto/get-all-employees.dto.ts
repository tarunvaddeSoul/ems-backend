import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateFormat } from '../../common/validators/date-format.decorator';
import { Status, SalaryCategory, SalarySubCategory, Title } from '@prisma/client';

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetAllEmployeesDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeDepartmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  highestEducationQualification?: string;

  @ApiPropertyOptional({
    enum: Status,
    description: 'Filter employees by status (ACTIVE or INACTIVE)',
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(15)
  @Type(() => Number)
  minAge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Max(100)
  @Type(() => Number)
  maxAge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: SortOrder })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateFormat({ message: 'startDate must be in the format DD-MM-YYYY' })
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateFormat({ message: 'endDate must be in the format DD-MM-YYYY' })
  endDate?: string;

  @ApiPropertyOptional({
    enum: SalaryCategory,
    description: 'Filter by salary category (CENTRAL, STATE, SPECIALIZED)',
  })
  @IsOptional()
  @IsEnum(SalaryCategory)
  salaryCategory?: SalaryCategory;

  @ApiPropertyOptional({
    enum: SalarySubCategory,
    description: 'Filter by salary sub-category (SKILLED, UNSKILLED, HIGHSKILLED, SEMISKILLED)',
  })
  @IsOptional()
  @IsEnum(SalarySubCategory)
  salarySubCategory?: SalarySubCategory;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by PF enabled status',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  pfEnabled?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by ESIC enabled status',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  esicEnabled?: boolean;

  @ApiPropertyOptional({
    type: Number,
    description: 'Minimum salary (filters by salaryPerDay for CENTRAL/STATE or monthlySalary for SPECIALIZED)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minSalary?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum salary (filters by salaryPerDay for CENTRAL/STATE or monthlySalary for SPECIALIZED)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxSalary?: number;

  @ApiPropertyOptional({
    enum: Title,
    description: 'Filter by title (MR, MS)',
  })
  @IsOptional()
  @IsEnum(Title)
  title?: Title;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by blood group',
  })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by city',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by state',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by district',
  })
  @IsOptional()
  @IsString()
  district?: string;
}
