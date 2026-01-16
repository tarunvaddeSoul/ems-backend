import { ApiProperty } from '@nestjs/swagger';

export class AttendanceSheetListItemDto {
  @ApiProperty({ type: 'string', example: 'sheet_1' })
  id: string;

  @ApiProperty({ type: 'string', example: 'company_123' })
  companyId: string;

  @ApiProperty({ type: 'string', example: 'TCS' })
  companyName: string;

  @ApiProperty({ type: 'string', example: '2025-10' })
  month: string;

  @ApiProperty({
    type: 'string',
    example: 'https://s3.../attendance-sheets/TCS/2025-10',
  })
  attendanceSheetUrl: string;
}

export class PaginationMetaDto {
  @ApiProperty({ type: 'number', example: 50 })
  total: number;

  @ApiProperty({ type: 'number', example: 1 })
  page: number;

  @ApiProperty({ type: 'number', example: 20 })
  limit: number;

  @ApiProperty({ type: 'number', example: 3 })
  totalPages: number;
}

export class AttendanceSheetListResponseDto {
  @ApiProperty({ type: [AttendanceSheetListItemDto] })
  data: AttendanceSheetListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
