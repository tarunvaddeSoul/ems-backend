import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: 'string',
    format: 'email',
    description: 'User email address',
    example: 'user@example.com',
    required: true,
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({
    type: 'string',
    format: 'password',
    description: 'User password (6-20 characters)',
    example: 'password123',
    required: true,
    minLength: 6,
    maxLength: 20,
  })
  password: string;
}
