import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { Response } from 'express';

@ApiTags('Departments')
@Controller('departments')
@UseInterceptors(TransformInterceptor)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post('user-department:name')
  async addUserDepartment(@Param('name') name: string, @Res() res: Response) {
    const department = await this.departmentService.addUserDepartment(name);
    return res.status(department.statusCode).json(department);
  }

  @Post('employee-department:name')
  async addEmployeeDepartment(
    @Param('name') name: string,
    @Res() res: Response,
  ) {
    const department = await this.departmentService.addEmployeeDepartment(name);
    return res.status(department.statusCode).json(department);
  }

  @Get('user-departments')
  async getAllUserDepartments(@Res() res: Response) {
    const departments = await this.departmentService.getAllUserDepartments();
    return res.status(departments.statusCode).json(departments);
  }

  @Get('employee-departments')
  async getAllEmployeeDepartments(@Res() res: Response) {
    const departments =
      await this.departmentService.getAllEmployeeDepartments();
    return res.status(departments.statusCode).json(departments);
  }

  @Delete('user-department:name')
  async deleteUserDepartmentByName(
    @Param('name') name: string,
    @Res() res: Response,
  ) {
    const department = await this.departmentService.deleteUserDepartmentByName(
      name,
    );
    return res.status(department.statusCode).json(department);
  }

  @Delete('employee-department:name')
  async deleteEmployeeDepartmentByName(
    @Param('name') name: string,
    @Res() res: Response,
  ) {
    const department =
      await this.departmentService.deleteEmployeeDepartmentByName(name);
    return res.status(department.statusCode).json(department);
  }
}
