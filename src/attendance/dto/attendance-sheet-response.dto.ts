import { ApiProperty } from '@nestjs/swagger';

export class AttendanceSheetResponseDto {
  @ApiProperty({ type: 'string', example: 'sheet_1' })
  id: string;

  @ApiProperty({ type: 'string', example: 'comp_1' })
  companyId: string;

  @ApiProperty({ type: 'string', example: '2025-10' })
  month: string;

  @ApiProperty({ type: 'string', example: 'https://cdn/.../file.pdf' })
  attendanceSheetUrl: string;
}
