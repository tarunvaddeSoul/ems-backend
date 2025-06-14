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
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
import { PayrollService } from './payroll.service';
import { Response } from 'express';
import { FinalizePayrollDto } from './dto/finalize-payroll.dto';

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
      'Calculates payroll for all employees working for a specific company in the given period',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payroll calculated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request: Invalid data provided.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: Company, payroll period, or employees not found.',
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
      'Persists the reviewed payroll records for a company and month',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payroll finalized and saved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request: Invalid data provided.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: Company or employees not found.',
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
      'Retrieve payroll records for a specific employee, optionally filtered by company and date range',
  })
  @ApiParam({ name: 'employeeId', required: true, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({
    name: 'startMonth',
    required: false,
    type: String,
    example: '2025-01',
  })
  @ApiQuery({
    name: 'endMonth',
    required: false,
    type: String,
    example: '2025-05',
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
    summary: 'Get payroll report',
    description:
      'Retrieve paginated, filterable payroll records for a company or employee',
  })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiQuery({
    name: 'startMonth',
    required: false,
    type: String,
    example: '2025-01',
  })
  @ApiQuery({
    name: 'endMonth',
    required: false,
    type: String,
    example: '2025-05',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'month',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    example: 'desc',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payroll report retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request: Invalid data provided.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: No records found.',
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
    description: 'Retrieve payroll records for a specific company and month',
  })
  @ApiParam({ name: 'companyId', required: true, type: String })
  @ApiParam({
    name: 'payrollMonth',
    required: true,
    type: String,
    example: '2025-05',
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
      'Retrieve payroll statistics for a company within a date range',
  })
  @ApiQuery({ name: 'companyId', required: true, type: String })
  @ApiQuery({
    name: 'startMonth',
    required: false,
    type: String,
    example: '2025-01',
  })
  @ApiQuery({
    name: 'endMonth',
    required: false,
    type: String,
    example: '2025-05',
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
