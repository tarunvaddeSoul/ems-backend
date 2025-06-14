import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDesignationDto {
  @ApiProperty({
    description: 'The name of the designation',
    example: 'Senior Software Engineer',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
