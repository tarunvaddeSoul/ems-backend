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
import { ROLE } from 'src/enum/role.enum';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

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
  @IsEnum(ROLE)
  @ApiProperty({
    enum: ROLE,
    enumName: 'Role',
    description: 'User role',
    default: ROLE.USER,
  })
  role: ROLE = ROLE.USER;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  departmentId: string;
}
