import {
  BadRequestException,
  ConflictException,
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

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: Logger,
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password does not match');
    }
    return this.generateUserTokens(user.id);
  }

  async register(user: RegisterDto): Promise<any> {
    const existingUser = await this.usersRepository.findUserByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email already in use.');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    const newUser = await this.usersRepository.createUser(user);
    return this.generateUserTokens(newUser.id);
  }

  async generateUserTokens(userId: string) {
    const accessToken = await this.jwtService.sign(
      { userId },
      { expiresIn: '1h' },
    );
    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);
    return { accessToken, refreshToken };
  }

  async storeRefreshToken(token: string, userId: string) {
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
      return this.generateUserTokens(refreshTokenResponse.userId);
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
      if (updateUser) {
        return { status: 200, message: 'Password successfully updated!' };
      }
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
      return { status: 200, message: 'Email sent!' };
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDTO) {
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

      return { status: 200, message: 'Password reset successful!' };
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
}
