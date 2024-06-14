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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EmployeeService } from './employee.service';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { TransformInterceptor } from 'src/common/transform-interceptor';

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
      'Creates a new employee with the provided details and uploads photo and aadhaar files to S3.',
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
    ]),
  )
  async createEmployee(
    @Body() data: CreateEmployeeDto,
    @UploadedFiles()
    files: { photo?: Express.Multer.File[]; aadhaar?: Express.Multer.File[] },
  ) {
    return this.employeeService.createEmployee(
      data,
      files.photo ? files.photo[0] : null,
      files.aadhaar ? files.aadhaar[0] : null,
    );
  }

  @Version('1')
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
    ]),
  )
  async updateEmployee(
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDto,
    @UploadedFiles()
    files: { photo?: Express.Multer.File[]; aadhaar?: Express.Multer.File[] },
  ) {
    const {
      name,
      address,
      salary,
      bankName,
      bankAccountName,
      bankAccountNumber,
      ifsc,
    } = data;
    const hasFiles = files.photo?.length > 0 || files.aadhaar?.length > 0;

    if (
      !name &&
      !address &&
      !salary &&
      !bankName &&
      !bankAccountName &&
      !bankAccountNumber &&
      !ifsc &&
      !hasFiles
    ) {
      throw new BadRequestException(
        'At least one property must be provided for update.',
      );
    }
    return this.employeeService.updateEmployee(
      id,
      data,
      files.photo ? files.photo[0] : null,
      files.aadhaar ? files.aadhaar[0] : null,
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

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get All Employees',
    description: 'Retrieves a list of all employees.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees retrieved successfully.',
  })
  async getAllEmployees() {
    return this.employeeService.getAllEmployees();
  }
}
