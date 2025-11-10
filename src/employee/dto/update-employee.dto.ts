import { IsOptional, IsString, IsInt, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  Title,
  Gender,
  Status,
  Category,
  SalaryCategory,
  SalarySubCategory,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class UpdateEmployeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Title)
  title?: Title;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  motherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  husbandName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeOnboardingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeRelievingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsOptional()
  @IsString()
  recruitedBy?: string;

  @ApiPropertyOptional({
    description: 'Age is automatically calculated from dateOfBirth when dateOfBirth is updated. Manual age values will be overridden if dateOfBirth is provided.',
    readOnly: true,
  })
  @IsOptional()
  @IsInt()
  age?: number;

  // Salary fields
  @ApiPropertyOptional({
    enum: SalaryCategory,
    description: 'Salary category (CENTRAL, STATE, SPECIALIZED)',
  })
  @IsOptional()
  @IsEnum(SalaryCategory)
  salaryCategory?: SalaryCategory;

  @ApiPropertyOptional({
    enum: SalarySubCategory,
    description:
      'Salary sub-category (SKILLED, UNSKILLED, HIGHSKILLED, SEMISKILLED). Required if salaryCategory is CENTRAL or STATE',
  })
  @IsOptional()
  @IsEnum(SalarySubCategory)
  salarySubCategory?: SalarySubCategory;

  @ApiPropertyOptional({
    type: 'number',
    description:
      'Monthly salary for SPECIALIZED category. Not used for CENTRAL/STATE categories',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  monthlySalary?: number;

  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Whether PF is enabled for this employee',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  pfEnabled?: boolean;

  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Whether ESIC is enabled for this employee',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  esicEnabled?: boolean;
}

export class UpdateEmployeeContactDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  permanentAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  presentAddress?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pincode?: number;
}

export class UpdateEmployeeBankDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ifscCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsOptional()
  @IsString()
  bankCity?: string;
}

export class UpdateEmployeeAdditionalDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pfUanNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  esicNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policeVerificationNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policeVerificationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trainingCertificateNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trainingCertificateDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicalCertificateNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicalCertificateDate?: string;
}

export class UpdateEmployeeReferenceDetailsDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsOptional()
  @IsString()
  referenceName?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsOptional()
  @IsString()
  referenceAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}

export class UpdateEmployeeDocumentUploadsDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  photo?: Express.Multer.File;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  aadhaar?: Express.Multer.File;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  panCard?: Express.Multer.File;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  bankPassbook?: Express.Multer.File;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  markSheet?: Express.Multer.File;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  otherDocument?: Express.Multer.File;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsOptional()
  otherDocumentRemarks?: string;
}
