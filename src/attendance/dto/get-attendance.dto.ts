import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsString } from 'class-validator';

export class GetAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', required: true })
  employeeId: string;

  @ApiProperty({ type: 'string', required: true })
  @IsNotEmpty()
  @IsDateString()
  month: string; // Format: YYYY-MM
}
