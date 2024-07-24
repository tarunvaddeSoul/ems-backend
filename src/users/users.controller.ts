import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from 'src/users/auth.guard';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { RolesGuard } from './role.guard';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { Auth } from './auth.decorator';
import { TransformInterceptor } from 'src/common/transform-interceptor';

@Controller('users')
// @UseInterceptors(TransformInterceptor)
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
    const userId = req.user['userId'];
    const { oldPassword, newPassword } = changePasswordDto;
    return this.usersService.changePassword(
      oldPassword,
      newPassword,
      userId,
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
  @ApiBearerAuth('Bearer')
  @Get('profile')
  async getUserProfile(@Req() req: any) {
    const userId = req.user['userId'];
    return this.usersService.getUserProfile(userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('Bearer')
  @Get('me')
  async getCurrentUser(@Req() req: any) {
    const userId = req.user['userId'];
    return this.usersService.getCurrentUser(userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('Bearer')
  @Post('logout')
  async logoutUser(@Body() body: { refreshToken: string }) {
    await this.usersService.logoutUser(body.refreshToken);
    return { message: 'Logout successful' };
  }

  @Get('admin-only')
  @Auth(Role.ADMIN)
  adminOnly() {
    return 'This is only for admins';
  }

  @Get('hr-operations')
  @Auth(Role.HR, Role.OPERATIONS)
  hrAndOperations() {
    return 'This is for HR and Operations';
  }
}
