import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  photo?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  aadhaar?: Express.Multer.File;
}
