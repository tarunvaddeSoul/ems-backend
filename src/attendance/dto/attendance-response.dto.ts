import { ApiProperty } from '@nestjs/swagger';

export class AttendanceResponseDto {
  @ApiProperty({
    type: 'string',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Attendance record unique identifier',
  })
  id: string;

  @ApiProperty({
    type: 'string',
    example: 'TSS9934',
    description: 'Employee ID',
  })
  employeeId: string;

  @ApiProperty({
    type: 'string',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
    description: 'Company ID',
  })
  companyId: string;

  @ApiProperty({
    type: 'string',
    example: '2025-10',
    description: 'Month in YYYY-MM format',
  })
  month: string;

  @ApiProperty({
    type: 'number',
    example: 22,
    description: 'Number of present days',
    minimum: 0,
  })
  presentCount: number;
}

export class AttendanceListResponseDto extends AttendanceResponseDto {
  @ApiProperty({
    type: 'string',
    example: 'John Doe',
    description: 'Full name of the employee',
  })
  employeeName: string;

  @ApiProperty({
    type: 'string',
    example: 'TSS9934',
    description: 'Employee ID (same as employeeId)',
  })
  employeeID: string;

  @ApiProperty({
    type: 'string',
    example: 'Security',
    description: 'Department name',
    nullable: true,
  })
  departmentName: string | null;

  @ApiProperty({
    type: 'string',
    example: 'Guard',
    description: 'Designation name',
    nullable: true,
  })
  designationName: string | null;
}
