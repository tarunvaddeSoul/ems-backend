import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CompanyModule } from './company/company.module';
import { EmployeeModule } from './employee/employee.module';
import { PayrollModule } from './salary/payroll.module';
import { PrismaModule } from './prisma/prisma.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DepartmentModule } from './departments/department.module';
import { DesignationModule } from './designations/designation.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SalaryRateScheduleModule } from './salary-rate-schedule/salary-rate-schedule.module';

@Module({
  imports: [
    UsersModule,
    CompanyModule,
    EmployeeModule,
    PayrollModule,
    PrismaModule,
    AttendanceModule,
    DepartmentModule,
    DesignationModule,
    DashboardModule,
    SalaryRateScheduleModule,
  ],
})
export class AppModule {}
