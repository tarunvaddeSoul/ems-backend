import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsEnum, IsString } from 'class-validator';
enum Status {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}
export class MarkAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', required: true })
  employeeId: string;

  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  @IsDateString()
  date: string;

  @ApiProperty({ type: 'string', required: true })
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status; // 'Present' or 'Absent'
}
