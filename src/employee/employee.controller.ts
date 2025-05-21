import {
  Controller,
  Post,
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
  Patch,
  Res,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EmployeeService } from './employee.service';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import {
  UpdateEmployeeAdditionalDetailsDto,
  UpdateEmployeeBankDetailsDto,
  UpdateEmployeeContactDetailsDto,
  UpdateEmployeeDocumentUploadsDto,
  UpdateEmployeeDto,
  UpdateEmployeeReferenceDetailsDto,
} from './dto/update-employee.dto';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { DeleteEmployeesDto } from './dto/delete-employees.dto';
import { GetAllEmployeesDto } from './dto/get-all-employees.dto';
import {
  CreateEmploymentHistoryDto,
  LeavingDateDto,
  UpdateEmploymentHistoryDto,
} from './dto/employment-history.dto';
import { Response } from 'express';

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
      { name: 'panCard', maxCount: 1 },
      { name: 'bankPassbook', maxCount: 1 },
      { name: 'markSheet', maxCount: 1 },
      { name: 'otherDocument', maxCount: 1 },
    ]),
  )
  async createEmployee(
    @Res() res: Response,
    @Body() data: CreateEmployeeDto,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      aadhaar?: Express.Multer.File[];
      panCard?: Express.Multer.File[];
      bankPassbook?: Express.Multer.File[];
      markSheet?: Express.Multer.File[];
      otherDocument?: Express.Multer.File[];
    },
  ): Promise<Response> {
    const response = await this.employeeService.createEmployee(
      data,
      files.photo ? files.photo[0] : null,
      files.aadhaar ? files.aadhaar[0] : null,
      files.panCard ? files.panCard[0] : null,
      files.bankPassbook ? files.bankPassbook[0] : null,
      files.markSheet ? files.markSheet[0] : null,
      files.otherDocument ? files.otherDocument[0] : null,
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiResponse({
    status: 200,
    description: 'The employee has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  async updateEmployee(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Response> {
    const response = await this.employeeService.updateEmployee(
      id,
      updateEmployeeDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':id/contact-details')
  @ApiOperation({ summary: 'Update employee contact details' })
  @ApiResponse({
    status: 200,
    description: 'The employee contact details have been successfully updated.',
  })
  async updateEmployeeContactDetails(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeContactDetailsDto,
  ): Promise<Response> {
    const response = await this.employeeService.updateEmployeeContactDetails(
      id,
      updateDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':id/bank-details')
  @ApiOperation({ summary: 'Update employee bank details' })
  @ApiResponse({
    status: 200,
    description: 'The employee bank details have been successfully updated.',
  })
  async updateEmployeeBankDetails(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeBankDetailsDto,
  ): Promise<Response> {
    const response = await this.employeeService.updateEmployeeBankDetails(
      id,
      updateDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':id/additional-details')
  @ApiOperation({ summary: 'Update employee additional details' })
  @ApiResponse({
    status: 200,
    description:
      'The employee additional details have been successfully updated.',
  })
  async updateEmployeeAdditionalDetails(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeAdditionalDetailsDto,
  ): Promise<Response> {
    const response = await this.employeeService.updateEmployeeAdditionalDetails(
      id,
      updateDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':id/reference-details')
  @ApiOperation({ summary: 'Update employee reference details' })
  @ApiResponse({
    status: 200,
    description:
      'The employee reference details have been successfully updated.',
  })
  async updateEmployeeReferenceDetails(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeReferenceDetailsDto,
  ): Promise<Response> {
    const response = await this.employeeService.updateEmployeeReferenceDetails(
      id,
      updateDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':id/document-uploads')
  @ApiOperation({ summary: 'Update employee document uploads' })
  @ApiResponse({
    status: 200,
    description:
      'The employee document uploads have been successfully updated.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'aadhaar', maxCount: 1 },
      { name: 'panCard', maxCount: 1 },
      { name: 'bankPassbook', maxCount: 1 },
      { name: 'markSheet', maxCount: 1 },
      { name: 'otherDocument', maxCount: 1 },
    ]),
  )
  async updateEmployeeDocumentUploads(
    @Res() res: Response,
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      aadhaar?: Express.Multer.File[];
      panCard?: Express.Multer.File[];
      bankPassbook?: Express.Multer.File[];
      markSheet?: Express.Multer.File[];
      otherDocument?: Express.Multer.File[];
    },
    @Body() updateDto: UpdateEmployeeDocumentUploadsDto,
  ): Promise<Response> {
    const updatedDto = {
      ...updateDto,
      photo: files.photo?.[0],
      aadhaar: files.aadhaar?.[0],
      panCard: files.panCard?.[0],
      bankPassbook: files.bankPassbook?.[0],
      markSheet: files.markSheet?.[0],
      otherDocument: files.otherDocument?.[0],
    };
    const response = await this.employeeService.updateEmployeeDocumentUploads(
      id,
      updatedDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Post(':employeeId/employment-history')
  @ApiOperation({ summary: 'Create a new employment history record' })
  @ApiResponse({
    status: 201,
    description: 'The employment history record has been successfully created.',
  })
  async createEmploymentHistory(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
    @Body() createDto: CreateEmploymentHistoryDto,
  ): Promise<Response> {
    createDto.employeeId = employeeId;
    const response = await this.employeeService.createEmploymentHistory(
      createDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch('employment-history/:id')
  @ApiOperation({ summary: 'Update an employment history record' })
  @ApiResponse({
    status: 200,
    description: 'The employment history record has been successfully updated.',
  })
  async updateEmploymentHistory(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmploymentHistoryDto,
  ): Promise<Response> {
    const response = await this.employeeService.updateEmploymentHistory(
      id,
      updateDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':employeeId/close-employment')
  @ApiOperation({ summary: 'Close the current employment record' })
  @ApiResponse({
    status: 200,
    description: 'The current employment record has been successfully closed.',
  })
  async closeCurrentEmployment(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
    @Body() data: LeavingDateDto,
  ): Promise<Response> {
    const response = await this.employeeService.closeCurrentEmployment(
      employeeId,
      data.leavingDate,
    );
    return res.status(response.statusCode).json(response);
  }

  @Get(':employeeId/employment-history')
  @ApiOperation({ summary: "Get employee's employment history" })
  @ApiResponse({
    status: 200,
    description: 'The employment history has been successfully retrieved.',
  })
  async getEmploymentHistory(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
  ): Promise<Response> {
    const response = await this.employeeService.getEmploymentHistory(
      employeeId,
    );
    return res.status(response.statusCode).json(response);
  }

  @Get(':employeeId/contact-details')
  @ApiOperation({ summary: 'Get employee contact details' })
  @ApiParam({ name: 'employeeId', required: true, description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee contact details retrieved successfully',
  })
  async getEmployeeContactDetails(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
  ): Promise<Response> {
    const response = await this.employeeService.getEmployeeContactDetails(
      employeeId,
    );
    return res.status(response.statusCode).json(response);
  }

  @Get(':employeeId/bank-details')
  @ApiOperation({ summary: 'Get employee bank details' })
  @ApiParam({ name: 'employeeId', required: true, description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee bank details retrieved successfully',
  })
  async getEmployeeBankDetails(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
  ): Promise<Response> {
    const response = await this.employeeService.getEmployeeBankDetails(
      employeeId,
    );
    return res.status(response.statusCode).json(response);
  }

  @Get(':employeeId/additional-details')
  @ApiOperation({ summary: 'Get employee additional details' })
  @ApiParam({ name: 'employeeId', required: true, description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee additional details retrieved successfully',
  })
  async getEmployeeAdditionalDetails(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
  ): Promise<Response> {
    const response = await this.employeeService.getEmployeeAdditionalDetails(
      employeeId,
    );
    return res.status(response.statusCode).json(response);
  }

  @Get(':employeeId/reference-details')
  @ApiOperation({ summary: 'Get employee reference details' })
  @ApiParam({ name: 'employeeId', required: true, description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee reference details retrieved successfully',
  })
  async getEmployeeReferenceDetails(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
  ): Promise<Response> {
    const response = await this.employeeService.getEmployeeReferenceDetails(
      employeeId,
    );
    return res.status(response.statusCode).json(response);
  }

  @Get(':employeeId/document-uploads')
  @ApiOperation({ summary: 'Get employee document uploads' })
  @ApiParam({ name: 'employeeId', required: true, description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee document uploads retrieved successfully',
  })
  async getEmployeeDocumentUploads(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
  ): Promise<Response> {
    const response = await this.employeeService.getEmployeeDocumentUploads(
      employeeId,
    );
    return res.status(response.statusCode).json(response);
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
  async getEmployeeById(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<Response> {
    const response = await this.employeeService.getEmployeeById(id);
    return res.status(response.statusCode).json(response);
  }

  @Get('active/:employeeId')
  @ApiOperation({ summary: 'Get active employment for an employee' })
  @ApiResponse({
    status: 200,
    description: 'The active employment has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'No active employment found.' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  async getActiveEmployment(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
  ): Promise<Response> {
    const response = await this.employeeService.getActiveEmployment(employeeId);
    if (!response.data) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'No active employment found',
      });
    }
    return res.status(response.statusCode).json(response);
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
  async deleteEmployeeById(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<Response> {
    const response = await this.employeeService.deleteEmployeeById(id);
    return res.status(response.statusCode).json(response);
  }

  @Version('1')
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Multiple Employees',
    description: 'Delete multiple employees by their IDs',
  })
  async deleteMultipleEmployees(
    @Res() res: Response,
    @Body() deleteEmployeesDto: DeleteEmployeesDto,
  ): Promise<Response> {
    const response = await this.employeeService.deleteMultipleEmployees(
      deleteEmployeesDto.ids,
    );
    return res.status(response.statusCode).json(response);
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
  async getAllEmployees(
    @Res() res: Response,
    @Query() queryParams: GetAllEmployeesDto,
  ): Promise<Response> {
    const response = await this.employeeService.getAllEmployees(queryParams);
    return res.status(response.statusCode).json(response);
  }
}
