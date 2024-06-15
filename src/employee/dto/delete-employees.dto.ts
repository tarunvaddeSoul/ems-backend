import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class DeleteEmployeesDto {
  @ApiProperty({ type: [String], description: 'Array of Employee IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
