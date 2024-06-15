import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CalculateSalaryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', required: true })
  employeeId: string;

  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, example: '2024-06' })
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month must be in YYYY-MM format' })
  month: string;
}
