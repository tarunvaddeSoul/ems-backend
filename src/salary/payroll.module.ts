import { Logger, Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { EmployeeRepository } from 'src/employee/employee.repository';
import { AttendanceRepository } from 'src/attendance/attendance.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyRepository } from 'src/company/company.repository';
import { PayrollRepository } from './payroll.repository';
import { PayrollService } from './payroll.service';
import { SalaryRateScheduleModule } from 'src/salary-rate-schedule/salary-rate-schedule.module';

@Module({
  imports: [SalaryRateScheduleModule],
  controllers: [PayrollController],
  providers: [
    EmployeeRepository,
    AttendanceRepository,
    CompanyRepository,
    Logger,
    PrismaService,
    PayrollRepository,
    PayrollService,
  ],
})
export class PayrollModule {}
