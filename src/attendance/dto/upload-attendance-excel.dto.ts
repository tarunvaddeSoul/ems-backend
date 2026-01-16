import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UploadAttendanceExcelDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'Company ID (UUID format)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
    required: true,
  })
  companyId: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM',
  })
  @ApiProperty({
    type: 'string',
    description: 'Month in YYYY-MM format',
    example: '2025-10',
    required: true,
    pattern: '^\\d{4}-\\d{2}$',
  })
  month: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Attendance Excel file (XLSX, XLS - max 10MB)',
    required: true,
  })
  file: Express.Multer.File;
}
