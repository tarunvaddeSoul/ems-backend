import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CompanyModule } from './company/company.module';
import { EmployeeModule } from './employee/employee.module';
import { SalaryModule } from './salary/salary.module';

@Module({
  imports: [UsersModule, CompanyModule, EmployeeModule, SalaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
