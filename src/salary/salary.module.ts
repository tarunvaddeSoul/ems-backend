import { Logger, Module } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { EmployeeRepository } from 'src/employee/employee.repository';
import { AttendanceRepository } from 'src/attendance/attendance.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SalaryController],
  providers: [
    SalaryService,
    EmployeeRepository,
    AttendanceRepository,
    Logger,
    PrismaService,
  ],
})
export class SalaryModule {}
