import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAttendanceDto {
  @IsUUID('4', { each: true })
  @ApiProperty({
    type: [String],
    description: 'Array of attendance record IDs to delete',
  })
  ids: string[];
}
