import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GetActiveEmployeesDto {
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
    message: 'Month must be in the format YYYY-MM',
  })
  @ApiProperty({
    type: 'string',
    description: 'Month in the format YYYY-MM',
    example: '2025-10',
    required: true,
  })
  month: string;
}

