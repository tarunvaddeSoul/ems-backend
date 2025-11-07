import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SalaryType } from '@prisma/client';

export class GetEmployeesResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  designation: string;

  @ApiProperty()
  department: string;

  @ApiProperty()
  salary: number;

  @ApiPropertyOptional({
    description: 'Per-day salary rate (for CENTRAL/STATE employees)',
  })
  salaryPerDay: number | null;

  @ApiPropertyOptional({
    enum: SalaryType,
    description: 'Salary type (PER_DAY or PER_MONTH)',
  })
  salaryType: SalaryType | null;

  @ApiProperty()
  joiningDate: string;

  @ApiProperty()
  leavingDate: string | null;
}
