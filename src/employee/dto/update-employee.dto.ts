import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  companyId: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  photo: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  aadhaar: Express.Multer.File;
}
