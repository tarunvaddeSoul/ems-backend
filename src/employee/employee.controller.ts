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
  Query,
  HttpException,
  Patch,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EmployeeService } from './employee.service';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeAdditionalDetailsDto, UpdateEmployeeBankDetailsDto, UpdateEmployeeContactDetailsDto, UpdateEmployeeDocumentUploadsDto, UpdateEmployeeDto, UpdateEmployeeReferenceDetailsDto } from './dto/update-employee.dto';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { DeleteEmployeesDto } from './dto/delete-employees.dto';
import { GetAllEmployeesDto } from './dto/get-all-employees.dto';
import { Employee, EmployeeDocumentUploads, EmploymentHistory } from '@prisma/client';
import { CreateEmploymentHistoryDto, LeavingDateDto, UpdateEmploymentHistoryDto } from './dto/employment-history.dto';

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

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiResponse({
    status: 200,
    description: 'The employee has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<{ message: string; data: Employee }> {
    return this.employeeService.updateEmployee(id, updateEmployeeDto);
  }

  @Patch(':id/contact-details')
  @ApiOperation({ summary: 'Update employee contact details' })
  @ApiResponse({ status: 200, description: 'The employee contact details have been successfully updated.' })
  async updateEmployeeContactDetails(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeContactDetailsDto,
  ) {
    return this.employeeService.updateEmployeeContactDetails(id, updateDto);
  }

  @Patch(':id/bank-details')
  @ApiOperation({ summary: 'Update employee bank details' })
  @ApiResponse({ status: 200, description: 'The employee bank details have been successfully updated.' })
  async updateEmployeeBankDetails(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeBankDetailsDto,
  ) {
    return this.employeeService.updateEmployeeBankDetails(id, updateDto);
  }

  @Patch(':id/additional-details')
  @ApiOperation({ summary: 'Update employee additional details' })
  @ApiResponse({ status: 200, description: 'The employee additional details have been successfully updated.' })
  async updateEmployeeAdditionalDetails(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeAdditionalDetailsDto,
  ) {
    return this.employeeService.updateEmployeeAdditionalDetails(id, updateDto);
  }

  @Patch(':id/reference-details')
  @ApiOperation({ summary: 'Update employee reference details' })
  @ApiResponse({ status: 200, description: 'The employee reference details have been successfully updated.' })
  async updateEmployeeReferenceDetails(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeReferenceDetailsDto,
  ) {
    return this.employeeService.updateEmployeeReferenceDetails(id, updateDto);
  }

  @Patch(':id/document-uploads')
  @ApiOperation({ summary: 'Update employee document uploads' })
  @ApiResponse({ status: 200, description: 'The employee document uploads have been successfully updated.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'photo', maxCount: 1 },
    { name: 'aadhaar', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'bankPassbook', maxCount: 1 },
    { name: 'markSheet', maxCount: 1 },
    { name: 'otherDocument', maxCount: 1 },
  ]))
  async updateEmployeeDocumentUploads(
    @Param('id') id: string,
    @UploadedFiles() files: {
      photo?: Express.Multer.File[],
      aadhaar?: Express.Multer.File[],
      panCard?: Express.Multer.File[],
      bankPassbook?: Express.Multer.File[],
      markSheet?: Express.Multer.File[],
      otherDocument?: Express.Multer.File[],
    },
    @Body() updateDto: UpdateEmployeeDocumentUploadsDto,
  ): Promise<{ message: string; data: EmployeeDocumentUploads }> {
    const updatedDto = {
      ...updateDto,
      photo: files.photo?.[0],
      aadhaar: files.aadhaar?.[0],
      panCard: files.panCard?.[0],
      bankPassbook: files.bankPassbook?.[0],
      markSheet: files.markSheet?.[0],
      otherDocument: files.otherDocument?.[0],
    };
    return this.employeeService.updateEmployeeDocumentUploads(id, updatedDto);
  }

  @Post(':employeeId/employment-history')
  @ApiOperation({ summary: 'Create a new employment history record' })
  @ApiResponse({ status: 201, description: 'The employment history record has been successfully created.' })
  async createEmploymentHistory(
    @Param('employeeId') employeeId: string,
    @Body() createDto: CreateEmploymentHistoryDto,
  ): Promise<{ message: string; data: EmploymentHistory }> {
    createDto.employeeId = employeeId;
    return this.employeeService.createEmploymentHistory(createDto);
  }

  @Patch('employment-history/:id')
  @ApiOperation({ summary: 'Update an employment history record' })
  @ApiResponse({ status: 200, description: 'The employment history record has been successfully updated.' })
  async updateEmploymentHistory(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmploymentHistoryDto,
  ): Promise<{ message: string; data: EmploymentHistory }> {
    return this.employeeService.updateEmploymentHistory(id, updateDto);
  }

  @Patch(':employeeId/close-employment')
  @ApiOperation({ summary: 'Close the current employment record' })
  @ApiResponse({ status: 200, description: 'The current employment record has been successfully closed.' })
  async closeCurrentEmployment(
    @Param('employeeId') employeeId: string,
    @Body() data: LeavingDateDto,
  ): Promise<{ message: string; data: EmploymentHistory }> {
    return this.employeeService.closeCurrentEmployment(employeeId, data.leavingDate);
  }

  @Get(':id/employment-history')
  @ApiOperation({ summary: 'Get employee\'s employment history' })
  @ApiResponse({ status: 200, description: 'The employment history has been successfully retrieved.' })
  async getEmploymentHistory(@Param('id') id: string) {
    return this.employeeService.getEmploymentHistory(id);
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

  @Get('active/:employeeId')
  @ApiOperation({ summary: 'Get active employment for an employee' })
  @ApiResponse({
    status: 200,
    description: 'The active employment has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'No active employment found.' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  async getActiveEmployment(@Param('employeeId') employeeId: string) {
    const activeEmployment = await this.employeeService.getActiveEmployment(
      employeeId,
    );
    if (!activeEmployment) {
      throw new HttpException(
        'No active employment found',
        HttpStatus.NOT_FOUND,
      );
    }
    return activeEmployment;
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
    description:
      'Retrieves a list of employees with pagination, filtering, and sorting.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees retrieved successfully.',
  })
  async getAllEmployees(@Query() queryParams: GetAllEmployeesDto) {
    return this.employeeService.getAllEmployees(queryParams);
  }
}
