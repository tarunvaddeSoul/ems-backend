import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from './mail.service';
import { DepartmentRepository } from 'src/departments/department.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRY,
      },
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    Logger,
    UsersRepository,
    PrismaService,
    MailService,
    DepartmentRepository,
  ],
})
export class UsersModule {}
