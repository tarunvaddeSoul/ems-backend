import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ApiResponseDto, ApiErrorResponseDto } from 'src/common/dto/api-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from 'src/users/auth.guard';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { Auth } from './auth.decorator';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseInterceptors(TransformInterceptor)
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with email, password, and user details. Returns user data and authentication tokens.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: ApiResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'User registered successfully',
        data: {
          user: {
            id: 'user-uuid',
            name: 'John Doe',
            email: 'john@example.com',
            mobileNumber: '9876543210',
            role: 'USER',
          },
          accessToken: 'jwt-access-token',
          refreshToken: 'jwt-refresh-token',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error or email already exists',
    type: ApiErrorResponseDto,
  })
  async register(
    @Res() res: Response,
    @Body() registerDto: RegisterDto,
  ): Promise<Response> {
    const response = await this.usersService.register(registerDto);
    return res.status(response.statusCode).json(response);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates a user with email and password. Returns user data and JWT tokens (access and refresh).',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: ApiResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Login successful',
        data: {
          user: {
            id: 'user-uuid',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'USER',
          },
          accessToken: 'jwt-access-token',
          refreshToken: 'jwt-refresh-token',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
    type: ApiErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized',
      },
    },
  })
  async login(
    @Res() res: Response,
    @Body() loginDto: LoginDto,
  ): Promise<Response> {
    const response = await this.usersService.login(loginDto);
    return res.status(response.statusCode).json(response);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('Bearer')
  @Put('update/:id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    schema: {
      example: {
        statusCode: 200,
        message: 'User updated successfully',
        data: {
          id: 'user-uuid',
          name: 'John Doe',
          email: 'john@example.com',
          mobileNumber: '9876543210',
          role: 'USER',
          departmentId: 'department-uuid',
          createdAt: '2024-06-01T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUser(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Response> {
    const response = await this.usersService.updateUser(id, updateUserDto);
    return res.status(response.statusCode).json(response);
  }

  @Post('refresh-token/:refreshToken')
  @ApiOperation({
    summary: 'Refresh JWT token',
    description: 'Refreshes the access token using a valid refresh token. Returns new access and refresh tokens.',
  })
  @ApiParam({
    name: 'refreshToken',
    type: String,
    description: 'Refresh token obtained from login',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: ApiResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'new-jwt-access-token',
          refreshToken: 'new-jwt-refresh-token',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
    type: ApiErrorResponseDto,
  })
  async refreshToken(
    @Res() res: Response,
    @Param('refreshToken') refreshToken: string,
  ): Promise<Response> {
    const response = await this.usersService.refreshToken(refreshToken);
    return res.status(response.statusCode).json(response);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('Bearer')
  @Put('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDTO })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async changePassword(
    @Res() res: Response,
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDTO,
  ): Promise<Response> {
    const userId = req.user['userId'];
    const { oldPassword, newPassword } = changePasswordDto;
    const response = await this.usersService.changePassword(
      oldPassword,
      newPassword,
      userId,
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send forgot password email' })
  @ApiBody({ type: ForgotPasswordDTO })
  @ApiResponse({ status: 200, description: 'Forgot password email sent.' })
  async forgotPassword(
    @Res() res: Response,
    @Body() forgotPasswordDto: ForgotPasswordDTO,
  ): Promise<Response> {
    const response = await this.usersService.forgotPassword(
      forgotPasswordDto.email,
    );
    return res.status(response.statusCode).json(response);
  }

  @Put('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: ResetPasswordDTO })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  async resetPassword(
    @Res() res: Response,
    @Body() resetPasswordDto: ResetPasswordDTO,
  ): Promise<Response> {
    const response = await this.usersService.resetPassword(resetPasswordDto);
    return res.status(response.statusCode).json(response);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('Bearer')
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile fetched.' })
  async getUserProfile(
    @Res() res: Response,
    @Req() req: any,
  ): Promise<Response> {
    const userId = req.user['userId'];
    const response = await this.usersService.getUserProfile(userId);
    return res.status(response.statusCode).json(response);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('Bearer')
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user fetched.' })
  async getCurrentUser(
    @Res() res: Response,
    @Req() req: any,
  ): Promise<Response> {
    const userId = req.user['userId'];
    const response = await this.usersService.getCurrentUser(userId);
    return res.status(response.statusCode).json(response);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('Bearer')
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({ schema: { example: { refreshToken: 'string' } } })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  async logoutUser(@Body() body: { refreshToken: string }) {
    await this.usersService.logoutUser(body.refreshToken);
    return { message: 'Logout successful' };
  }

  @Get('admin-only')
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({ status: 200, description: 'This is only for admins.' })
  @Auth(Role.ADMIN)
  adminOnly() {
    return 'This is only for admins';
  }

  @Get('hr-operations')
  @ApiOperation({ summary: 'HR and Operations only endpoint' })
  @ApiResponse({ status: 200, description: 'This is for HR and Operations.' })
  @Auth(Role.HR, Role.OPERATIONS)
  hrAndOperations() {
    return 'This is for HR and Operations';
  }
}
