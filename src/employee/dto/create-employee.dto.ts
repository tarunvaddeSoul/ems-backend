import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsAlphanumeric, IsInt, IsPositive, Matches } from 'class-validator';
import { Category, EducationQualification, Gender, Status, Title } from '../enum/employee.enum';
import { IsDateFormat } from '../../common/validators/date-format.decorator';

export class CreateEmployeeDto {
  @ApiProperty({ enum: Title })
  @IsNotEmpty()
  @IsEnum(Title)
  title: Title;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  firstName: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  lastName: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  mobileNumber: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  recruitedBy: string;

  @ApiProperty({ enum: Gender })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  fatherName: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  motherName: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ? value.toUpperCase() : undefined)
  husbandName?: string;

  @ApiProperty({ enum: Category })
  @IsNotEmpty()
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @IsDateFormat({ message: 'dateOfBirth must be in the format DD-MM-YYYY' })
  dateOfBirth: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @IsDateFormat({ message: 'employeeOnboardingDate must be in the format DD-MM-YYYY' })
  employeeOnboardingDate: string;

  @ApiProperty({ enum: EducationQualification })
  @IsNotEmpty()
  @IsEnum(EducationQualification)
  highestEducationQualification: EducationQualification;
  
  @ApiProperty({ enum: Status })
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  bloodGroup: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  permanentAddress: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  presentAddress: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  city: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  district: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  state: string;

  @ApiProperty({ type: 'number' })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  pincode: number;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  referenceName: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  referenceAddress: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  referenceNumber: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  bankAccountNumber: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  ifscCode: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  bankCity: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  bankName: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  pfUanNumber: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  esicNumber: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  policeVerificationNumber: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @IsDateFormat({ message: 'policeVerificationDate must be in the format DD-MM-YYYY' })
  policeVerificationDate: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  trainingCertificateNumber: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @IsDateFormat({ message: 'trainingCertificateDate must be in the format DD-MM-YYYY' })

  trainingCertificateDate: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  medicalCertificateNumber: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  @IsDateFormat({ message: 'medicalCertificateDate must be in the format DD-MM-YYYY' })
  medicalCertificateDate: string;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  currentCompanyId?: string;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  currentCompanyDesignationId?: string;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  currentCompanyDepartmentId?: string;

  @ApiProperty({ type: 'number' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  currentCompanySalary?: number;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  @IsDateFormat({ message: 'currentJoiningDate must be in the format DD-MM-YYYY' })
  currentCompanyJoiningDate?: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsAlphanumeric()
  @Transform(({ value }) => value.toUpperCase())
  aadhaarNumber: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  aadhaar?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  panCard?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  bankPassbook?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  markSheet?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  otherDocument?: Express.Multer.File;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  otherDocumentRemarks?: string;
}
