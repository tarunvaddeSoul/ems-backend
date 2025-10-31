import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
import { PayrollService } from './payroll.service';
import { Response } from 'express';
import { FinalizePayrollDto } from './dto/finalize-payroll.dto';
import { ApiResponseDto, ApiErrorResponseDto } from 'src/common/dto/api-response.dto';

@ApiTags('Payroll')
@UseInterceptors(TransformInterceptor)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @HttpCode(HttpStatus.OK)
  @Post('calculate-payroll')
  @ApiOperation({
    summary: 'Calculate payroll for company employees',
    description:
      'Calculates payroll for all employees working for a specific company in the given period. Returns detailed salary breakdown including basic pay, allowances, deductions, and net salary.',
  })
  @ApiBody({ type: CalculatePayrollDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payroll calculated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid data provided',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found - Company, payroll period, or employees not found',
    type: ApiErrorResponseDto,
  })
  async calculatePayroll(
    @Res() res: Response,
    @Body() calculatePayrollDto: CalculatePayrollDto,
  ): Promise<Response> {
    const response = await this.payrollService.calculatePayroll(
      calculatePayrollDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('finalize')
  @ApiOperation({
    summary: 'Finalize payroll for a company and month',
    description:
      'Persists the reviewed payroll records for a company and month. Once finalized, payroll records cannot be modified.',
  })
  @ApiBody({ type: FinalizePayrollDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payroll finalized and saved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid data provided or payroll already finalized',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found - Company or employees not found',
    type: ApiErrorResponseDto,
  })
  async finalizePayroll(
    @Res() res: Response,
    @Body() finalizePayrollDto: FinalizePayrollDto,
  ): Promise<Response> {
    const response = await this.payrollService.finalizePayroll(
      finalizePayrollDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @HttpCode(HttpStatus.OK)
  @Get('employee-report/:employeeId')
  @ApiOperation({
    summary: 'Get payroll report for an employee',
    description:
      'Retrieve payroll records for a specific employee, optionally filtered by company and date range. Returns all salary records with full breakdown.',
  })
  @ApiParam({
    name: 'employeeId',
    required: true,
    type: String,
    description: 'Employee ID',
    example: 'TSS9934',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Filter by company ID (UUID)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
  })
  @ApiQuery({
    name: 'startMonth',
    required: false,
    type: String,
    description: 'Start month in YYYY-MM format',
    example: '2025-01',
  })
  @ApiQuery({
    name: 'endMonth',
    required: false,
    type: String,
    description: 'End month in YYYY-MM format',
    example: '2025-05',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll report retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
    type: ApiErrorResponseDto,
  })
  async getEmployeePayrollReport(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
    @Query('companyId') companyId?: string,
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
  ): Promise<Response> {
    const response = await this.payrollService.getEmployeePayrollReport(
      employeeId,
      companyId,
      startMonth,
      endMonth,
    );
    return res.status(response.statusCode).json(response);
  }

  @HttpCode(HttpStatus.OK)
  @Get('report')
  @ApiOperation({
    summary: 'Get payroll report with pagination',
    description:
      'Retrieve paginated, filterable payroll records for a company or employee. Supports filtering by company, employee, and month range, with pagination and sorting.',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Filter by company ID (UUID)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    type: String,
    description: 'Filter by employee ID',
    example: 'TSS9934',
  })
  @ApiQuery({
    name: 'startMonth',
    required: false,
    type: String,
    description: 'Start month in YYYY-MM format',
    example: '2025-01',
  })
  @ApiQuery({
    name: 'endMonth',
    required: false,
    type: String,
    description: 'End month in YYYY-MM format',
    example: '2025-05',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field',
    example: 'month',
    enum: ['month', 'employeeId', 'companyId'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payroll report retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid query parameters',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found - No records found',
    type: ApiErrorResponseDto,
  })
  async getPayrollReport(
    @Res() res: Response,
    @Query('companyId') companyId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sortBy') sortBy = 'month',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<Response> {
    // Validate params here if needed
    const response = await this.payrollService.getPayrollReport({
      companyId,
      employeeId,
      startMonth,
      endMonth,
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    });
    return res.status(response.statusCode).json(response);
  }

  @HttpCode(HttpStatus.OK)
  @Get('by-month/:companyId/:payrollMonth')
  @ApiOperation({
    summary: 'Get payroll records for a company by month',
    description: 'Retrieve all payroll records for a specific company and month. Returns detailed salary breakdown for each employee.',
  })
  @ApiParam({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID (UUID)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
  })
  @ApiParam({
    name: 'payrollMonth',
    required: true,
    type: String,
    description: 'Month in YYYY-MM format',
    example: '2025-05',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll records retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company or payroll records not found',
    type: ApiErrorResponseDto,
  })
  async getPayrollByMonth(
    @Res() res: Response,
    @Param('companyId') companyId: string,
    @Param('payrollMonth') payrollMonth: string,
  ): Promise<Response> {
    const response = await this.payrollService.getPayrollByMonth(
      companyId,
      payrollMonth,
    );
    return res.status(response.statusCode).json(response);
  }

  @HttpCode(HttpStatus.OK)
  @Get('stats')
  @ApiOperation({
    summary: 'Get payroll statistics for a company',
    description:
      'Retrieve aggregated payroll statistics for a company within a date range. Includes totals, averages, and breakdowns by month.',
  })
  @ApiQuery({
    name: 'companyId',
    required: true,
    type: String,
    description: 'Company ID (UUID)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
  })
  @ApiQuery({
    name: 'startMonth',
    required: false,
    type: String,
    description: 'Start month in YYYY-MM format',
    example: '2025-01',
  })
  @ApiQuery({
    name: 'endMonth',
    required: false,
    type: String,
    description: 'End month in YYYY-MM format',
    example: '2025-05',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll statistics retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    type: ApiErrorResponseDto,
  })
  async getPayrollStats(
    @Res() res: Response,
    @Query('companyId') companyId: string,
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
  ): Promise<Response> {
    const response = await this.payrollService.getPayrollStats(
      companyId,
      startMonth,
      endMonth,
    );
    return res.status(response.statusCode).json(response);
  }
}
