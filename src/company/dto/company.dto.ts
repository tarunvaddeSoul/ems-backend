import { PartialType } from '@nestjs/swagger';
import {
  CreateCompanyDto,
  SalaryTemplateConfigDto,
} from './create-company.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiPropertyOptional({ type: SalaryTemplateConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryTemplateConfigDto)
  salaryTemplates?: SalaryTemplateConfigDto;
}
