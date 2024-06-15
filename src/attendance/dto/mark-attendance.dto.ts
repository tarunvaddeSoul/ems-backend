import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsString,
  Matches,
} from 'class-validator';

enum Status {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

export class MarkAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'Employee ID (UUID format)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
    required: true,
  })
  employeeId: string;

  @IsNotEmpty()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM-DD',
  })
  @ApiProperty({
    type: 'string',
    description: 'Date of attendance in the format YYYY-MM-DD',
    example: '2024-06-14',
    required: true,
  })
  date: string;

  @ApiProperty({
    type: 'string',
    enum: Status,
    description: 'Attendance status (PRESENT or ABSENT)',
    example: 'PRESENT',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;
}
