import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsString, Matches } from 'class-validator';

export class GetAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', required: true })
  employeeId: string;

  @ApiProperty({ type: 'string', required: true })
  @IsNotEmpty()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM',
  })
  month: string; // Format: YYYY-MM
}

export class GetAttendanceByCompanyAndMonthDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', required: true })
  companyId: string;

  @ApiProperty({ type: 'string', required: true })
  @IsNotEmpty()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM',
  })
  month: string; // Format: YYYY-MM
}