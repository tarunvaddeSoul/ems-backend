import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CompanyModule } from './company/company.module';
import { EmployeeModule } from './employee/employee.module';
import { SalaryModule } from './salary/salary.module';
import { PrismaModule } from './prisma/prisma.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    UsersModule,
    CompanyModule,
    EmployeeModule,
    SalaryModule,
    PrismaModule,
    AttendanceModule,
  ],
})
export class AppModule {}
