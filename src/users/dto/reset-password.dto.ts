import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ResetPasswordDTO {
  @ApiProperty({
    type: 'string',
    description: 'Password reset token received via email',
    example: 'abc123xyz789...',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @ApiProperty({
    type: 'string',
    format: 'password',
    description: 'New password (6-20 characters)',
    example: 'newSecurePassword123',
    required: true,
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}
