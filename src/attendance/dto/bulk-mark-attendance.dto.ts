import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsUUID,
  Matches,
} from 'class-validator';

enum Status {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

export class BulkMarkAttendanceDto {
  @IsNotEmpty({ each: true })
  @IsUUID('4', { each: true })
  @ApiProperty({ type: [String], required: true })
  employeeIds: string[];

  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @ApiProperty({ type: 'string', required: true })
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status; // 'PRESENT' or 'ABSENT'
}
