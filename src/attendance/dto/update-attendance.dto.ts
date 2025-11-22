import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiProperty({
    description: 'Present count (days)',
    minimum: 0,
    required: false,
    example: 18,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  presentCount?: number;
}
