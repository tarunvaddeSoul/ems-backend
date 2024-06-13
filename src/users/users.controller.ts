import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from 'src/users/auth.guard';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Post('refresh-token/:refreshToken')
  async refreshToken(@Param('refreshToken') refreshToken: string) {
    return this.usersService.refreshToken(refreshToken);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('Bearer')
  @Put('change-password')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDTO,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;
    return this.usersService.changePassword(
      oldPassword,
      newPassword,
      req.userId,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    return this.usersService.forgotPassword(forgotPasswordDto.email);
  }

  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth('Bearer')
  async profile() {
    return { message: 'Authenticated' };
  }
}
