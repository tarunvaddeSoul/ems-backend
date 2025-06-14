import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, Matches } from 'class-validator';

export class CalculatePayrollDto {
  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
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
  payrollMonth: string;

  @ApiProperty({
    description:
      'Admin inputs for custom fields. Format: { employeeId: { fieldKey: value } }',
    type: Object,
    example: {
      TSS1001: { advanceTaken: 2000, bonus: 500 },
      TSS1002: { advanceTaken: 1000 },
    },
  })
  @IsOptional()
  adminInputs?: Record<string, Record<string, number>>;
}
