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

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: Logger,
    private readonly usersRepository: UsersRepository,
    private readonly departmentRepository: DepartmentRepository,
    private jwtService: JwtService,
    private mailService: MailService,
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

  private async generateUserTokens(
    userId: string,
    role: Role,
  ): Promise<ITokens> {
    const accessToken = await this.jwtService.sign(
      { userId, role },
      { expiresIn: '6h' },
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

  async changePassword(oldPassword: string, newPassword: string, userId: any) {
    try {
      const checkUserExists = await this.usersRepository.findUserById(userId);
      if (!checkUserExists) {
        throw new NotFoundException(
          `User with userId: ${userId} does not exist.`,
        );
      }
      if (oldPassword === newPassword) {
        throw new ConflictException(
          `New password cannot be the same as the old password.`,
        );
      }
      const isMatch = await bcrypt.compare(
        oldPassword,
        checkUserExists.password,
      );
      if (!isMatch) {
        throw new BadRequestException(
          'Old password does not match with the existing password.',
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      checkUserExists.password = hashedPassword;
      const updateUser = await this.usersRepository.updateUser(
        checkUserExists.id,
        checkUserExists,
      );
      if (!updateUser) {
        throw new BadRequestException(
          'Failed to update password. Please try again.',
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Password successfully updated!',
      };
    } catch (error) {
      this.logger.error(`Failed to change user password: ${error.message}`);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersRepository.findUserByEmail(email);
      if (!user) {
        throw new NotFoundException(
          `User with email: ${email} does not exist.`,
        );
      }

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
      return { statusCode: 200, message: 'Email sent!' };
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDTO): Promise<{
    statusCode: number;
    message: string;
  }> {
    try {
      const { resetToken, newPassword } = resetPasswordDto;
      const token = await this.usersRepository.getResetToken(resetToken);
      if (!token) {
        throw new UnauthorizedException('Invalid link');
      }
      const checkUserExists = await this.usersRepository.findUserById(
        token.userId,
      );
      if (!checkUserExists) {
        throw new NotFoundException(
          `User with userId: ${token.userId} does not exist.`,
        );
      }
      checkUserExists.password = await bcrypt.hash(newPassword, 10);
      await this.usersRepository.updateUser(
        checkUserExists.id,
        checkUserExists,
      );
      // Delete the reset token
      await this.usersRepository.deleteResetToken(token.id);

      return { statusCode: 200, message: 'Password reset successful!' };
    } catch (error) {
      console.error('Error in resetPassword:', error);
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
