import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  companyId: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  bankAccountName: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  ifsc: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  bankAccountNumber: string;

  @ApiProperty({ type: 'number' })
  @IsNotEmpty()
  @Type(() => Number)
  salary: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  photo?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  aadhaar?: Express.Multer.File;
}
