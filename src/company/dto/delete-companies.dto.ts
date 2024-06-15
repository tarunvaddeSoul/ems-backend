import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class DeleteCompaniesDto {
  @ApiProperty({ type: [String], description: 'Array of Company IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
