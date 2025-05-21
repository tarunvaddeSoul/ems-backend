import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshToken, ResetToken, User } from '@prisma/client'; // Adjust as per your project structure
import { RegisterDto } from './dto/register.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaService,
  ) {}

  async createUser(data: RegisterDto): Promise<User> {
    try {
      const { name, mobileNumber, email, password, role, departmentId } = data;
      const newUser = await this.prisma.user.create({
        data: {
          id: uuidv4(),
          name,
          mobileNumber,
          email,
          password,
          role,
          departmentId,
        },
      });
      return newUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      return error;
    }
  }

  async storeRefreshToken(token: string, userId: string, expiresAt: Date) {
    try {
      const storeRefreshTokenResponse = await this.prisma.refreshToken.upsert({
        where: {
          userId,
        },
        create: {
          token,
          userId,
          expiresAt,
        },
        update: {
          token,
          expiresAt,
        },
      });
      return storeRefreshTokenResponse;
    } catch (error) {
      this.logger.error(
        `Failed to create or update refresh token: ${error.message}`,
      );
      throw error;
    }
  }

  async storeResetToken(token: string, userId: string, expiresAt: Date) {
    try {
      const storeResetTokenResponse = await this.prisma.resetToken.create({
        data: {
          token,
          userId,
          expiresAt,
        },
      });
      return storeResetTokenResponse;
    } catch (error) {
      this.logger.error(`Failed to store reset token: ${error.message}`);
      throw error;
    }
  }

  async getResetToken(resetToken: string): Promise<ResetToken> {
    try {
      const tokenDetails = await this.prisma.resetToken.findFirst({
        where: { token: resetToken, expiresAt: { gte: new Date() } },
      });
      return tokenDetails;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      return error;
    }
  }

  async deleteResetToken(tokenId: string) {
    try {
      await this.prisma.resetToken.delete({
        where: { id: tokenId },
      });
    } catch (error) {
      console.error(`Failed to delete reset token: ${error.message}`);
      return error;
    }
  }

  async getRefreshToken(refreshToken: string): Promise<RefreshToken> {
    try {
      const tokenDetails = await this.prisma.refreshToken.findFirst({
        where: { token: refreshToken, expiresAt: { gte: new Date() } },
      });
      return tokenDetails;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      return error;
    }
  }

  async deleteRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { id: tokenId },
    });
  }

  async findUserById(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by id: ${error.message}`);
      return error;
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${error.message}`);
      return error;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id,
        },
        data,
      });
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`);
      return error;
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: {
          id,
        },
      });
      return deletedUser;
    } catch (error) {
      this.logger.error(`Failed to delete user: ${error.message}`);
      return error;
    }
  }
}
