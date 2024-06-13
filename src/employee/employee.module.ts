import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { EmployeeRepository } from './employee.repository';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository, AwsS3Service, PrismaService],
})
export class EmployeeModule {}
