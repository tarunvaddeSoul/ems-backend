import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';

@ApiTags('Departments')
@Controller('departments')
@UseInterceptors(TransformInterceptor)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post('user-department:name')
  async addUserDepartment(@Param('name') name: string) {
    return this.departmentService.addUserDepartment(name);
  }

  @Post('employee-department:name')
  async addEmployeeDepartment(@Param('name') name: string) {
    return this.departmentService.addEmployeeDepartment(name);
  }

  @Get('user-departments')
  async getAllUserDepartments() {
    return this.departmentService.getAllUserDepartments();
  }

  @Get('employee-departments')
  async getAllEmployeeDepartments() {
    return this.departmentService.getAllEmployeeDepartments();
  }

  @Delete('user-department:name')
  async deleteUserDepartmentByName(@Param('name') name: string) {
    return this.departmentService.deleteUserDepartmentByName(name);
  }

  @Delete('employee-department:name')
  async deleteEmployeeDepartmentByName(@Param('name') name: string) {
    return this.departmentService.deleteEmployeeDepartmentByName(name);
  }
}
