import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsString,
} from 'class-validator';
import { MarkAttendanceDto } from './mark-attendance.dto';

export class BulkMarkAttendanceDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MarkAttendanceDto)
  @ApiProperty({
    type: [MarkAttendanceDto],
    description: 'Array of attendance records',
    required: true,
  })
  records: MarkAttendanceDto[];


  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({
  //   type: 'string',
  //   description: 'Attendance Sheet URL',
  //   example: 'https://tss-ems-file-storage.s3.amazonaws.com/attendance-sheets/Google/2024-07',
  //   required: true,
  // })
  // attendanceSheetUrl: string;
}
