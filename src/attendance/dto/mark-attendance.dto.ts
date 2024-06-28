import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsDateString,
  IsString,
  Matches,
  IsInt,
  IsPositive,
} from 'class-validator';

export class MarkAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'Employee ID (UUID format)',
    example: 'TSS9934',
    required: true,
  })
  employeeId: string;

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
    description: 'Date of attendance in the format YYYY-MM',
    example: '2024-06',
    required: true,
  })
  month: string;

  @ApiProperty({
    type: 'number',
    description: 'Present Count',
    example: '30',
    required: true,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @IsNotEmpty()
  presentCount: number;
}
