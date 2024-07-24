import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsEnum, IsInt, IsPositive, Matches } from 'class-validator';
import { Category, EducationQualification, Gender, Status, Title } from '../enum/employee.enum';
import { IsDateFormat } from '../../common/validators/date-format.decorator';

export class UpdateEmployeeDto {
  @ApiProperty({ enum: Title, required: false })
  @IsOptional()
  @IsEnum(Title)
  title?: Title;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  firstName?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  lastName?: string;

  @ApiProperty({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  // @ApiProperty({ type: 'string', required: false })
  // @IsOptional()
  // @IsString()
  // designationId?: string;

  // @ApiProperty({ type: 'string', required: false })
  // @IsOptional()
  // @IsString()
  // departmentId?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  mobileNumber?: string;

  // @ApiProperty({ type: 'string', required: false })
  // @IsOptional()
  // @IsString()
  // @Transform(({ value }) => value?.toUpperCase())
  // companyName?: string;

  // @ApiProperty({ type: 'string', required: false })
  // @IsOptional()
  // @IsString()
  // companyId?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  currentCompanyId: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  currentCompanyDesignationId: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  currentCompanyDepartmentId: string;

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  currentCompanySalary: number;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @IsDateFormat({ message: 'currentJoiningDate must be in the format DD-MM-YYYY' })
  currentCompanyJoiningDate: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  recruitedBy?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  fatherName?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  motherName?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  husbandName?: string;

  @ApiProperty({ enum: Category, required: false })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @IsString()
  @IsDateFormat({ message: 'dateOfBirth must be in the format DD-MM-YYYY' })
  dateOfBirth?: string;

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  age?: number;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @IsDateFormat({ message: 'employeeOnboardingDate must be in the format DD-MM-YYYY' })
  employeeOnboardingDate: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @IsDateFormat({ message: 'employeeRelievingDate must be in the format DD-MM-YYYY' })
  employeeRelievingDate: string;

  @ApiProperty({ enum: EducationQualification, required: false })
  @IsOptional()
  @IsEnum(EducationQualification)
  highestEducationQualification?: EducationQualification;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  bloodGroup?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  permanentAddress?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  presentAddress?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  city?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  district?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  state?: string;

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  pincode: number;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  referenceName?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  referenceAddress?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  referenceNumber?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  bankAccountNumber?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  ifscCode?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  bankCity?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  bankName?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  pfUanNumber?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  esicNumber?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  policeVerificationNumber?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @IsString()
  @IsDateFormat({ message: 'dateOfBirth must be in the format DD-MM-YYYY' })
  policeVerificationDate?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  trainingCertificateNumber?: string;

  @ApiProperty({ type: 'Date', required: false })
  @IsOptional()
  @IsString()
  @IsDateFormat({ message: 'dateOfBirth must be in the format DD-MM-YYYY' })
  trainingCertificateDate?: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  medicalCertificateNumber?: string;

  @ApiProperty({ type: 'Date', required: false })
  @IsOptional()
  @IsString()
  @IsDateFormat({ message: 'dateOfBirth must be in the format DD-MM-YYYY' })
  medicalCertificateDate?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  photo?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  aadhaar?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  panCardUpload?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  bankPassbook?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  markSheet?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  otherDocument?: Express.Multer.File;

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salary?: number;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  aadhaarNumber?: string;

  companyName?: string;
}
