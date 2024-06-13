import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
