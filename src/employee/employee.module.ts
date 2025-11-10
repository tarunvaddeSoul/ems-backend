import { Logger, Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { EmployeeRepository } from './employee.repository';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { CompanyRepository } from 'src/company/company.repository';
import { DesignationRepository } from 'src/designations/designation.repository';
import { DepartmentRepository } from 'src/departments/department.repository';
import { SalaryRateScheduleModule } from 'src/salary-rate-schedule/salary-rate-schedule.module';

@Module({
  imports: [ConfigModule.forRoot(), SalaryRateScheduleModule],
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    EmployeeRepository,
    AwsS3Service,
    PrismaService,
    Logger,
    CompanyRepository,
    DesignationRepository,
    DepartmentRepository,
  ],
})
export class EmployeeModule {}
