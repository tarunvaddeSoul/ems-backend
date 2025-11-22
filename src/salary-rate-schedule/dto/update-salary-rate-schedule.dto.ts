import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateSalaryRateScheduleDto {
  @ApiPropertyOptional({
    description: 'Rate per day in rupees',
    example: 950,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ratePerDay?: number;

  @ApiPropertyOptional({
    description: 'Effective from date (ISO 8601 format)',
    example: '2024-04-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({
    description:
      'Effective to date (ISO 8601 format). Optional - null means ongoing',
    example: '2024-09-30T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({
    description: 'Whether this rate schedule is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
