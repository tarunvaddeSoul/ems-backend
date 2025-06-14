import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsArray,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IsDateFormat } from 'src/common/validators/date-format.decorator';

import {
  CompanyStatus,
  SalaryFieldCategory,
  SalaryFieldType,
  SalaryFieldPurpose,
  SalaryPaidStatus,
} from '../enum/company.enum';

// Base class for field rules
export class SalaryFieldRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  defaultValue?: string;

  @ApiPropertyOptional({ enum: SalaryPaidStatus, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(SalaryPaidStatus, { each: true })
  allowedValues?: SalaryPaidStatus[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requireRemarks?: boolean;
}

// Base class for all salary template fields
export class SalaryTemplateFieldDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ enum: SalaryFieldType })
  @IsEnum(SalaryFieldType)
  type: SalaryFieldType;

  @ApiProperty({ enum: SalaryFieldCategory })
  @IsEnum(SalaryFieldCategory)
  category: SalaryFieldCategory;

  @ApiProperty({ enum: SalaryFieldPurpose })
  @IsEnum(SalaryFieldPurpose)
  purpose: SalaryFieldPurpose;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SalaryFieldRuleDto)
  rules?: SalaryFieldRuleDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'If true, admin must fill this field for each employee each month',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresAdminInput?: boolean = false;
}

// Group all salary template fields
export class SalaryTemplateConfigDto {
  @ApiProperty({ type: [SalaryTemplateFieldDto] })
  @ValidateNested({ each: true })
  @Type(() => SalaryTemplateFieldDto)
  @IsArray()
  mandatoryFields: SalaryTemplateFieldDto[];

  @ApiProperty({ type: [SalaryTemplateFieldDto] })
  @ValidateNested({ each: true })
  @Type(() => SalaryTemplateFieldDto)
  @IsArray()
  optionalFields: SalaryTemplateFieldDto[];

  @ApiProperty({ type: [SalaryTemplateFieldDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SalaryTemplateFieldDto)
  @IsArray()
  customFields?: SalaryTemplateFieldDto[];
}

// Main DTO for company creation
export class CreateCompanyDto {
  @ApiProperty({
    required: true,
    description: 'Company name',
    example: 'ACME SECURITY',
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9\s\-&.]+$/, {
    message:
      'Company name can only contain alphanumeric characters, spaces, hyphens, ampersands, and periods',
  })
  name: string;

  @ApiProperty({
    required: true,
    description: 'Company address',
    example: '123 SECURE AVENUE, CITY',
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    required: true,
    description: 'Contact person name',
    example: 'JOHN DOE',
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsString()
  @IsNotEmpty()
  contactPersonName: string;

  @ApiProperty({
    required: true,
    description: 'Contact person number',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: 'Contact person number must be a 10-digit number',
  })
  contactPersonNumber: string;

  @ApiProperty({
    required: true,
    enum: CompanyStatus,
    description: 'Company status',
    example: 'ACTIVE',
  })
  @IsEnum(CompanyStatus)
  status: CompanyStatus;

  @ApiProperty({
    required: true,
    description: 'Company onboarding date in DD-MM-YYYY format',
    example: '15-05-2023',
  })
  @IsDateFormat({
    message: 'companyOnboardingDate must be in the format DD-MM-YYYY',
  })
  companyOnboardingDate: string;

  @ApiProperty({
    required: true,
    type: SalaryTemplateConfigDto,
    description: 'Salary template configuration',
    example: {
      mandatoryFields: [
        {
          key: 'serialNumber',
          label: 'S.No',
          type: 'NUMBER',
          category: 'MANDATORY_NO_RULES',
          purpose: 'INFORMATION',
          enabled: true,
        },
        {
          key: 'companyName',
          label: 'Company Name',
          type: 'TEXT',
          category: 'MANDATORY_NO_RULES',
          purpose: 'INFORMATION',
          enabled: true,
        },
        {
          key: 'employeeName',
          label: 'Employee Name',
          type: 'TEXT',
          category: 'MANDATORY_NO_RULES',
          purpose: 'INFORMATION',
          enabled: true,
        },
        {
          key: 'designation',
          label: 'Designation',
          type: 'TEXT',
          category: 'MANDATORY_NO_RULES',
          purpose: 'INFORMATION',
          enabled: true,
        },
        {
          key: 'monthlyPay',
          label: 'Monthly Pay',
          type: 'NUMBER',
          category: 'MANDATORY_NO_RULES',
          purpose: 'CALCULATION',
          enabled: true,
        },
        {
          key: 'basicDuty',
          label: 'Basic Duty',
          type: 'NUMBER',
          category: 'MANDATORY_WITH_RULES',
          purpose: 'CALCULATION',
          enabled: true,
          rules: {
            defaultValue: 30,
          },
        },
        {
          key: 'grossSalary',
          label: 'Gross Salary',
          type: 'NUMBER',
          category: 'MANDATORY_NO_RULES',
          purpose: 'CALCULATION',
          enabled: true,
        },
        {
          key: 'totalDeduction',
          label: 'Total Deduction',
          type: 'NUMBER',
          category: 'MANDATORY_NO_RULES',
          purpose: 'CALCULATION',
          enabled: true,
        },
        {
          key: 'netSalary',
          label: 'Net Salary',
          type: 'NUMBER',
          category: 'MANDATORY_NO_RULES',
          purpose: 'CALCULATION',
          enabled: true,
        },
      ],
      optionalFields: [
        {
          key: 'pf',
          label: 'PF (12%)',
          type: 'NUMBER',
          category: 'OPTIONAL_NO_RULES',
          purpose: 'DEDUCTION',
          enabled: true,
        },
        {
          key: 'esic',
          label: 'ESIC (0.75%)',
          type: 'NUMBER',
          category: 'OPTIONAL_NO_RULES',
          purpose: 'DEDUCTION',
          enabled: true,
        },
        {
          key: 'fatherName',
          label: 'Father Name',
          type: 'TEXT',
          category: 'OPTIONAL_NO_RULES',
          purpose: 'INFORMATION',
          enabled: true,
        },
        {
          key: 'uanNumber',
          label: 'UAN No.',
          type: 'TEXT',
          category: 'OPTIONAL_NO_RULES',
          purpose: 'INFORMATION',
          enabled: true,
        },
        {
          key: 'wagesPerDay',
          label: 'Wages Per Day',
          type: 'NUMBER',
          category: 'OPTIONAL_NO_RULES',
          purpose: 'CALCULATION',
          enabled: true,
        },
        {
          key: 'lwf',
          label: 'LWF',
          type: 'NUMBER',
          category: 'OPTIONAL_WITH_RULES',
          purpose: 'DEDUCTION',
          enabled: true,
          rules: {
            defaultValue: 10,
          },
        },
      ],
      customFields: [
        {
          key: 'attendanceBonus',
          label: 'Attendance Bonus',
          type: 'NUMBER',
          category: 'CUSTOM',
          purpose: 'ALLOWANCE',
          enabled: true,
          rules: {
            defaultValue: 500,
          },
          description: 'Bonus for full attendance',
        },
      ],
    },
  })
  @ValidateNested()
  @Type(() => SalaryTemplateConfigDto)
  salaryTemplates: SalaryTemplateConfigDto;
}
