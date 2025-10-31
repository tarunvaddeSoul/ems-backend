import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { Response } from 'express';
import { ApiResponseDto, ApiErrorResponseDto } from 'src/common/dto/api-response.dto';

@ApiTags('Departments')
@Controller('departments')
@UseInterceptors(TransformInterceptor)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post('user-department/:name')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create user department',
    description: 'Creates a new user department with the specified name',
  })
  @ApiParam({
    name: 'name',
    description: 'Department name',
    example: 'HR',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'User department created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Department may already exist',
    type: ApiErrorResponseDto,
  })
  async addUserDepartment(@Param('name') name: string, @Res() res: Response) {
    const department = await this.departmentService.addUserDepartment(name);
    return res.status(department.statusCode).json(department);
  }

  @Post('employee-department/:name')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create employee department',
    description: 'Creates a new employee department with the specified name',
  })
  @ApiParam({
    name: 'name',
    description: 'Department name',
    example: 'Engineering',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Employee department created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Department may already exist',
    type: ApiErrorResponseDto,
  })
  async addEmployeeDepartment(
    @Param('name') name: string,
    @Res() res: Response,
  ) {
    const department = await this.departmentService.addEmployeeDepartment(name);
    return res.status(department.statusCode).json(department);
  }

  @Get('user-departments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all user departments',
    description: 'Retrieves a list of all user departments',
  })
  @ApiResponse({
    status: 200,
    description: 'User departments retrieved successfully',
    type: ApiResponseDto,
  })
  async getAllUserDepartments(@Res() res: Response) {
    const departments = await this.departmentService.getAllUserDepartments();
    return res.status(departments.statusCode).json(departments);
  }

  @Get('employee-departments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all employee departments',
    description: 'Retrieves a list of all employee departments',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee departments retrieved successfully',
    type: ApiResponseDto,
  })
  async getAllEmployeeDepartments(@Res() res: Response) {
    const departments =
      await this.departmentService.getAllEmployeeDepartments();
    return res.status(departments.statusCode).json(departments);
  }

  @Delete('user-department/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user department by name',
    description: 'Deletes a user department with the specified name',
  })
  @ApiParam({
    name: 'name',
    description: 'Department name',
    example: 'HR',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User department deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
    type: ApiErrorResponseDto,
  })
  async deleteUserDepartmentByName(
    @Param('name') name: string,
    @Res() res: Response,
  ) {
    const department = await this.departmentService.deleteUserDepartmentByName(
      name,
    );
    return res.status(department.statusCode).json(department);
  }

  @Delete('employee-department/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete employee department by name',
    description: 'Deletes an employee department with the specified name',
  })
  @ApiParam({
    name: 'name',
    description: 'Department name',
    example: 'Engineering',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Employee department deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
    type: ApiErrorResponseDto,
  })
  async deleteEmployeeDepartmentByName(
    @Param('name') name: string,
    @Res() res: Response,
  ) {
    const department =
      await this.departmentService.deleteEmployeeDepartmentByName(name);
    return res.status(department.statusCode).json(department);
  }
}
