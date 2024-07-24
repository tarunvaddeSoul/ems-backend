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
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  @ApiProperty()
  mobileNumber: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    description: 'User role',
    default: Role.USER,
  })
  role: Role = Role.USER;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  departmentId: string;
}
