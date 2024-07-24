import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  Version,
  HttpCode,
  HttpStatus,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EmployeeService } from './employee.service';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { DeleteEmployeesDto } from './dto/delete-employees.dto';
import { GetAllEmployeesDto } from './dto/get-all-employees.dto';

@Controller('employees')
@UseInterceptors(TransformInterceptor)
@ApiTags('Employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Employee',
    description:
      'Creates a new employee with the provided details and uploads photo, aadhaar, and other documents to S3.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Employee created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'aadhaar', maxCount: 1 },
      { name: 'panCardUpload', maxCount: 1 },
      { name: 'bankPassbook', maxCount: 1 },
      { name: 'markSheet', maxCount: 1 },
      { name: 'otherDocument', maxCount: 1 },
    ]),
  )
  async createEmployee(
    @Body() data: CreateEmployeeDto,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      aadhaar?: Express.Multer.File[];
      panCardUpload?: Express.Multer.File[];
      bankPassbook?: Express.Multer.File[];
      markSheet?: Express.Multer.File[];
      otherDocument?: Express.Multer.File[];
    },
  ) {
    return this.employeeService.createEmployee(
      data,
      files.photo ? files.photo[0] : null,
      files.aadhaar ? files.aadhaar[0] : null,
      files.panCardUpload ? files.panCardUpload[0] : null,
      files.bankPassbook ? files.bankPassbook[0] : null,
      files.markSheet ? files.markSheet[0] : null,
      files.otherDocument ? files.otherDocument[0] : null,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update Employee',
    description:
      'Updates an existing employee by ID and optionally uploads new photo and aadhaar files to S3.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'aadhaar', maxCount: 1 },
      { name: 'panCardUpload', maxCount: 1 },
      { name: 'bankPassbook', maxCount: 1 },
      { name: 'markSheet', maxCount: 1 },
      { name: 'otherDocument', maxCount: 1 },
    ]),
  )
  async updateEmployee(
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDto,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      aadhaar?: Express.Multer.File[];
      panCardUpload?: Express.Multer.File[];
      bankPassbook?: Express.Multer.File[];
      markSheet?: Express.Multer.File[];
      otherDocument?: Express.Multer.File[];
    },
  ) {
    const hasFiles =
      files.photo?.length > 0 ||
      files.aadhaar?.length > 0 ||
      files.panCardUpload?.length > 0 ||
      files.bankPassbook?.length > 0 ||
      files.markSheet?.length > 0 ||
      files.otherDocument?.length > 0;

    // Check if at least one property must be provided for update.
    const hasUpdateData = Object.values(data).some((value) => value !== undefined && value !== null);

    if (!hasUpdateData && !hasFiles) {
      throw new BadRequestException('At least one property must be provided for update.');
    }

    return this.employeeService.updateEmployee(
      id,
      data,
      files.photo ? files.photo[0] : null,
      files.aadhaar ? files.aadhaar[0] : null,
      files.panCardUpload ? files.panCardUpload[0] : null,
      files.bankPassbook ? files.bankPassbook[0] : null,
      files.markSheet ? files.markSheet[0] : null,
      files.otherDocument ? files.otherDocument[0] : null,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Employee by ID',
    description: 'Retrieves the details of an employee by their ID.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found.',
  })
  async getEmployeeById(@Param('id') id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  @Get('employment-history/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Employment history by ID',
    description: 'Retrieves the employment history details of an employee by their ID.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found.',
  })
  async getEmploymentHistory(@Param('id') id: string) {
    return this.employeeService.getEmploymentHistory(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Employee by ID',
    description: 'Deleete an employee by their ID.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found.',
  })
  async deleteEmployeeById(@Param('id') id: string) {
    return this.employeeService.deleteEmployeeById(id);
  }

  @Version('1')
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Multiple Employees',
    description: 'Delete multiple employees by their IDs',
  })
  async deleteMultipleEmployees(
    @Body() deleteEmployeesDto: DeleteEmployeesDto,
  ) {
    return this.employeeService.deleteMultipleEmployees(deleteEmployeesDto.ids);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get All Employees',
    description: 'Retrieves a list of employees with pagination, filtering, and sorting.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees retrieved successfully.',
  })
  async getAllEmployees(@Query() queryParams: GetAllEmployeesDto) {
    return this.employeeService.getAllEmployees(queryParams);
  }
}
