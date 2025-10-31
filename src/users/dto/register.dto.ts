import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role } from '../enum/roles.enum';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'Full name of the user',
    example: 'John Doe',
    required: true,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  @ApiProperty({
    type: 'string',
    description: 'Mobile number (exactly 10 digits)',
    example: '9876543210',
    required: true,
    minLength: 10,
    maxLength: 10,
    pattern: '^[0-9]{10}$',
  })
  mobileNumber: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: 'string',
    format: 'email',
    description: 'User email address (must be unique)',
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

  @IsOptional()
  @IsEnum(Role)
  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    description: 'User role (default: USER)',
    default: Role.USER,
    required: false,
    example: Role.USER,
  })
  role: Role = Role.USER;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'Department ID (UUID)',
    example: 'dept-uuid-123',
    required: true,
  })
  departmentId: string;
}
