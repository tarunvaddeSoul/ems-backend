import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwt_config } from '../auth/config/jwt';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from './mail.service';
import { DepartmentRepository } from 'src/departments/department.repository';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: jwt_config.secret,
      signOptions: {
        expiresIn: jwt_config.expired,
      },
    }),
    ConfigModule.forRoot(),
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
