import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
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
}
