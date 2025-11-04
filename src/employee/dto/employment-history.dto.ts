import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
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

  @ApiPropertyOptional()
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateFormat({ message: 'leavingDate must be in the format DD-MM-YYYY' })
  @IsString()
  leavingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class LeavingDateDto {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsDateFormat({ message: 'leavingDate must be in the format DD-MM-YYYY' })
  @IsString()
  leavingDate: string;
}
