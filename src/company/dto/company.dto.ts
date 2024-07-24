import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsString, ValidateNested, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IsDateFormat } from 'src/common/validators/date-format.decorator';
import { Status } from 'src/employee/enum/employee.enum';

class SalaryTemplateFieldDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  value?: string;
}

export class SalaryTemplateDto {
  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  name: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  fatherName: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  companyName: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  designation: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  monthlyRate: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  basicDuty: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  dutyDone: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  wagesPerDay: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  basicPay: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  epfWages: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  otherAllowance: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  otherAllowanceRemark: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  bonus: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  grossSalary: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  pf: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  esic: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  advance: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  uniform: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  advanceGivenBy: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  penalty: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  lwf: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  otherDeductions: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  otherDeductionsRemark: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  totalDeductions: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  netSalary: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  uanNumber: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  pfPaidStatus: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  esicNumber: SalaryTemplateFieldDto;

  @ApiProperty({ type: () => SalaryTemplateFieldDto })
  @ValidateNested()
  @Type(() => SalaryTemplateFieldDto)
  esicFilingStatus: SalaryTemplateFieldDto;
}

export class CreateCompanyDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  address: string;

  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  contactPersonName: string;

  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  contactPersonNumber: string;

  @ApiProperty({ required: true, enum: Status })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ required: true })
  @IsDateFormat({ message: 'companyOnboardingDate must be in the format DD-MM-YYYY' })
  companyOnboardingDate: string;

  @ApiProperty({ required: true, type: () => SalaryTemplateDto })
  @ValidateNested()
  @Type(() => SalaryTemplateDto)
  salaryTemplates: SalaryTemplateDto[];
}

export class UpdateCompanyDto extends PartialType(OmitType(CreateCompanyDto, ['salaryTemplates'] as const)) {
  @ApiProperty({ required: false, type: () => SalaryTemplateDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryTemplateDto)
  salaryTemplates?: SalaryTemplateDto[];
}