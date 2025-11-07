import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status, SalaryType } from '@prisma/client';
import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { IsDateFormat } from 'src/common/validators/date-format.decorator';

export class CreateEmploymentHistoryDto {
  employeeId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  designationId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  departmentId: string;

  @ApiPropertyOptional({
    description: 'Salary snapshot (monthly equivalent). OPTIONAL - If not provided, will be auto-calculated from employee\'s current salary configuration. For CENTRAL/STATE: salaryPerDay * 30, For SPECIALIZED: monthlySalary. Only provide manually for special cases.',
    example: 26790,
  })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsDateFormat({ message: 'joiningDate must be in the format DD-MM-YYYY' })
  joiningDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateFormat({ message: 'leavingDate must be in the format DD-MM-YYYY' })
  @IsString()
  leavingDate: string;
}

export class UpdateEmploymentHistoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  designationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiPropertyOptional({
    description: 'Per-day salary rate (for CENTRAL/STATE employees). Auto-calculated when joining date changes.',
  })
  @IsOptional()
  @IsNumber()
  salaryPerDay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateFormat({ message: 'joiningDate must be in the format DD-MM-YYYY' })
  @IsString()
  joiningDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateFormat({ message: 'leavingDate must be in the format DD-MM-YYYY' })
  @IsString()
  leavingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({
    enum: SalaryType,
    description: 'Salary type (PER_DAY or PER_MONTH). Auto-set when salary is recalculated',
  })
  @IsOptional()
  @IsEnum(SalaryType)
  salaryType?: SalaryType;
}

export class LeavingDateDto {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsDateFormat({ message: 'leavingDate must be in the format DD-MM-YYYY' })
  @IsString()
  leavingDate: string;
}
