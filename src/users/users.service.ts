import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { MailService } from './mail.service';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { DepartmentRepository } from 'src/departments/department.repository';
import { Role, User } from '@prisma/client';
import { IResponse } from 'src/types/response.interface';
import { ITokens, IUser } from './interfaces/user.interface';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: Logger,
    private readonly usersRepository: UsersRepository,
    private readonly departmentRepository: DepartmentRepository,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<IResponse<IUser>> {
    try {
      const { email, password } = loginDto;
      const user = await this.usersRepository.findUserByEmail(email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Password does not match');
      }
      const tokens = await this.generateUserTokens(user.id, user.role);
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
            departmentId: user.departmentId,
            createdAt: user.createdAt,
          },
          tokens,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async register(user: RegisterDto): Promise<IResponse<IUser>> {
    try {
      const existingUser = await this.usersRepository.findUserByEmail(
        user.email,
      );
      if (existingUser) {
        throw new ConflictException('Email already in use.');
      }
      const department = await this.departmentRepository.getUserDepartmentById(
        user.departmentId,
      );
      if (!department) {
        throw new NotFoundException(
          `Department with ID: ${user.departmentId} not found.`,
        );
      }
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      const newUser = await this.usersRepository.createUser(user);
      const tokens = await this.generateUserTokens(newUser.id, newUser.role);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            mobileNumber: newUser.mobileNumber,
            role: newUser.role,
            departmentId: newUser.departmentId,
            createdAt: newUser.createdAt,
          },
          tokens,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<IResponse<Omit<User, 'password'>>> {
    try {
      const user = await this.usersRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      if (updateUserDto.departmentId) {
        const department =
          await this.departmentRepository.getUserDepartmentById(
            updateUserDto.departmentId,
          );
        if (!department) {
          throw new NotFoundException(
            `Department with ID: ${updateUserDto.departmentId} not found.`,
          );
        }
      }

      const updatedUser = await this.usersRepository.updateUser(
        userId,
        updateUserDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobileNumber: updatedUser.mobileNumber,
          role: updatedUser.role,
          departmentId: updatedUser.departmentId,
          createdAt: updatedUser.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`);
      throw error;
    }
  }

  private async generateUserTokens(
    userId: string,
    role: Role,
  ): Promise<ITokens> {
    const jwtExpiry = this.configService.get<string>('JWT_EXPIRY') || '6h';
    const accessToken = await this.jwtService.sign(
      { userId, role },
      { expiresIn: jwtExpiry },
    );
    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);
    return { accessToken, refreshToken };
  }
  async getUserRole(userId: string): Promise<Role> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user.role;
  }

  async updateUserRole(userId: string, role: Role): Promise<void> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.role = role;
    await this.usersRepository.updateUser(userId, user);
  }

  async hasRole(userId: string, role: Role): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return userRole === role;
  }
  async storeRefreshToken(
    token: string,
    userId: string,
  ): Promise<{
    message: string;
  }> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    await this.usersRepository.storeRefreshToken(token, userId, expiryDate);
    return { message: 'Success' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshTokenResponse = await this.usersRepository.getRefreshToken(
        refreshToken,
      );
      if (!refreshTokenResponse) {
        throw new UnauthorizedException('Token invalid.');
      }
      const user = await this.usersRepository.findUserById(
        refreshTokenResponse.userId,
      );

      const tokens = await this.generateUserTokens(
        refreshTokenResponse.userId,
        user.role,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
            departmentId: user.departmentId,
            createdAt: user.createdAt,
          },
          tokens,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    oldPassword: string,
    newPassword: string,
    userId: string,
  ): Promise<IResponse<null>> {
    try {
      const user = await this.usersRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundException(
          `User with userId: ${userId} does not exist.`,
        );
      }

      // Validate old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException(
          'Old password does not match with the existing password.',
        );
      }

      // Check if new password is same as old password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new ConflictException(
          'New password cannot be the same as the old password.',
        );
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateUser = await this.usersRepository.updateUser(user.id, {
        password: hashedPassword,
      });

      if (!updateUser) {
        throw new BadRequestException(
          'Failed to update password. Please try again.',
        );
      }

      // Invalidate all refresh tokens (security: force re-login on all devices)
      await this.usersRepository.invalidateUserRefreshTokens(user.id);

      this.logger.log(`Password changed successfully for user: ${user.id}`);

      return {
        statusCode: HttpStatus.OK,
        message: 'Password successfully updated!',
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to change user password for userId ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<IResponse<null>> {
    try {
      const user = await this.usersRepository.findUserByEmail(email);

      // Security: Don't reveal if email exists or not
      // Always return success message to prevent email enumeration attacks
      if (!user) {
        this.logger.warn(
          `Password reset requested for non-existent email: ${email}`,
        );
        // Return success to prevent email enumeration
        return {
          statusCode: HttpStatus.OK,
          message:
            'If an account with that email exists, a password reset link has been sent.',
          data: null,
        };
      }

      // Invalidate any existing reset tokens for this user
      await this.usersRepository.invalidateUserResetTokens(user.id);

      // Generate reset token and expiry date
      const resetToken = nanoid(64);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      // Store the reset token in the database
      await this.usersRepository.storeResetToken(
        resetToken,
        user.id,
        expiryDate,
      );

      // Send email with reset link
      await this.mailService.sendForgotPasswordEmail(email, resetToken);

      this.logger.log(`Password reset token generated for user: ${user.id}`);

      return {
        statusCode: HttpStatus.OK,
        message:
          'If an account with that email exists, a password reset link has been sent.',
        data: null,
      };
    } catch (error) {
      this.logger.error(`Error in forgotPassword for email ${email}:`, error);
      // Still return success to prevent email enumeration
      return {
        statusCode: HttpStatus.OK,
        message:
          'If an account with that email exists, a password reset link has been sent.',
        data: null,
      };
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDTO,
  ): Promise<IResponse<null>> {
    try {
      const { resetToken, newPassword } = resetPasswordDto;

      // Validate token exists and is not expired
      const token = await this.usersRepository.getResetToken(resetToken);
      if (!token) {
        throw new UnauthorizedException(
          'Invalid or expired reset token. Please request a new password reset link.',
        );
      }

      // Check if token has expired (additional check)
      if (token.expiresAt < new Date()) {
        await this.usersRepository.deleteResetToken(token.id);
        throw new UnauthorizedException(
          'Reset token has expired. Please request a new password reset link.',
        );
      }

      // Get user
      const user = await this.usersRepository.findUserById(token.userId);
      if (!user) {
        await this.usersRepository.deleteResetToken(token.id);
        throw new NotFoundException(
          'User associated with this token does not exist.',
        );
      }

      // Check if new password is same as current password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from your current password.',
        );
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersRepository.updateUser(user.id, {
        password: hashedPassword,
      });

      // Invalidate all reset tokens for this user (security: prevent token reuse)
      await this.usersRepository.invalidateUserResetTokens(user.id);

      // Invalidate all refresh tokens (security: force re-login on all devices)
      await this.usersRepository.invalidateUserRefreshTokens(user.id);

      // Send confirmation email
      try {
        await this.mailService.sendPasswordResetConfirmationEmail(
          user.email,
          user.name,
        );
      } catch (emailError) {
        // Log but don't fail the password reset if email fails
        this.logger.warn(
          `Failed to send password reset confirmation email to ${user.email}:`,
          emailError,
        );
      }

      this.logger.log(`Password reset successful for user: ${user.id}`);

      return {
        statusCode: HttpStatus.OK,
        message:
          'Password reset successful! Please login with your new password.',
        data: null,
      };
    } catch (error) {
      this.logger.error('Error in resetPassword:', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async profile(userId: number) {
    try {
      // Implement your logic to fetch the user profile from database
      return null;
    } catch (error) {
      this.logger.error(`Failed to fetch user profile: ${error.message}`);
      throw error;
    }
  }

  async getUserProfile(
    userId: string,
  ): Promise<IResponse<Omit<User, 'password'>>> {
    try {
      const user = await this.usersRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'User profile fetched successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          role: user.role,
          departmentId: user.departmentId,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch user profile: ${error.message}`);
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<IResponse<Partial<User>>> {
    try {
      const user = await this.usersRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      // Remove sensitive information
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...currentUser } = user;
      return {
        statusCode: HttpStatus.OK,
        message: 'Current user fetched successfully',
        data: currentUser,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch current user: ${error.message}`);
      throw error;
    }
  }

  async logoutUser(refreshToken: string): Promise<void> {
    try {
      const token = await this.usersRepository.getRefreshToken(refreshToken);
      if (!token) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      await this.usersRepository.deleteRefreshToken(token.id);
    } catch (error) {
      this.logger.error(`Failed to logout user: ${error.message}`);
      throw error;
    }
  }
}
