import { Logger, Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './attendance.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmployeeRepository } from 'src/employee/employee.repository';
import { CompanyRepository } from 'src/company/company.repository';

@Module({
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceRepository,
    PrismaService,
    Logger,
    EmployeeRepository,
    CompanyRepository
  ],
})
export class AttendanceModule {}
