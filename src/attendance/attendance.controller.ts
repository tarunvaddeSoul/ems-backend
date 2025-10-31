import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  Patch,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { DeleteAttendanceDto } from './dto/delete-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAttendanceSheetDto } from './dto/upload-attendance-sheet.dto';
import { GetAttendanceByCompanyAndMonthDto } from './dto/get-attendance.dto';
import { GetActiveEmployeesDto } from './dto/get-active-employees.dto';
import { Response } from 'express';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceSheetResponseDto } from './dto/attendance-sheet-response.dto';
import { AttendanceReportResponseDto } from './dto/attendance-report-response.dto';
import { ListAttendanceQueryDto } from './dto/list-attendance-query.dto';
import { ListAttendanceSheetsDto } from './dto/list-attendance-sheets.dto';
import { AttendanceSheetListResponseDto } from './dto/attendance-sheet-list-response.dto';
import { AttendanceResponseDto, AttendanceListResponseDto } from './dto/attendance-response.dto';
import { ApiResponseWrapperDto, ApiErrorResponseDto } from './dto/api-response-wrapper.dto';

@ApiTags('Attendance')
@UseInterceptors(TransformInterceptor)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Mark attendance for an employee',
    description: 'Creates or updates attendance record for an employee in a specific company and month. Validates that the employee was active during the specified month.',
  })
  @ApiBody({ type: MarkAttendanceDto })
  @ApiResponse({
    status: 201,
    description: 'Attendance marked successfully',
    type: ApiResponseWrapperDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Attendance marked',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          employeeId: 'TSS9934',
          companyId: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
          month: '2025-10',
          presentCount: 22,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error or business rule violation',
    type: ApiErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'presentCount must be between 0 and 31 for 2025-10',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Employee or Company not found',
    type: ApiErrorResponseDto,
  })
  async markAttendance(
    @Res() res: Response,
    @Body() markAttendanceDto: MarkAttendanceDto,
  ): Promise<Response> {
    const response = await this.attendanceService.markAttendance(
      markAttendanceDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bulk Mark Attendance',
    description: 'Mark attendance for multiple employees in a single request. All records are processed atomically - either all succeed or all fail. Validates employment status for each employee.',
  })
  @ApiBody({ type: BulkMarkAttendanceDto })
  @ApiResponse({
    status: 201,
    description: 'Bulk attendance processed successfully',
    type: ApiResponseWrapperDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Bulk attendance processed',
        data: [
          {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            employeeId: 'TSS1001',
            companyId: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
            month: '2025-10',
            presentCount: 22,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Check message for details',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Some employee records not found',
    type: ApiErrorResponseDto,
  })
  async bulkMarkAttendance(
    @Res() res: Response,
    @Body() bulkMarkAttendanceDto: BulkMarkAttendanceDto,
  ): Promise<Response> {
    const response = await this.attendanceService.bulkMarkAttendance(
      bulkMarkAttendanceDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload attendance sheet',
    description: 'Upload attendance sheet',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('attendanceSheet'))
  async uploadAttendanceSheet(
    @Res() res: Response,
    @Body() uploadAttendanceSheetDto: UploadAttendanceSheetDto,
    @UploadedFile() attendanceSheet?: Express.Multer.File,
  ): Promise<Response> {
    const response = await this.attendanceService.uploadAttendanceSheet(
      uploadAttendanceSheetDto,
      attendanceSheet,
    );
    return res.status(response.statusCode).json(response);
  }

  @Get('active-employees')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active employees for a company and month',
    description: 'Returns employees who were active (employed) in the company during the specified month. Useful for bulk attendance marking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active employees retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async getActiveEmployeesForMonth(
    @Res() res: Response,
    @Query() queryParams: GetActiveEmployeesDto,
  ): Promise<Response> {
    const response = await this.attendanceService.getActiveEmployeesForMonth(
      queryParams,
    );
    return res.status(response.statusCode).json(response);
  }

  @HttpCode(HttpStatus.OK)
  @Get('records-by-company-and-month')
  @ApiOperation({ summary: 'Get total attendance for a company by month' })
  @ApiResponse({
    status: 200,
    description: 'Total attendance retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getAllAttendanceRecordsByCompanyIdAndMonth(
    @Res() res: Response,
    @Query() queryParams: GetAttendanceByCompanyAndMonthDto,
  ): Promise<Response> {
    const { companyId, month } = queryParams;
    const response =
      await this.attendanceService.getAllAttendanceRecordsByCompanyIdAndMonth(
        companyId,
        month,
      );
    return res.status(response.statusCode).json(response);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve attendance records',
    description: 'List attendance rows by optional filters: companyId, month, employeeId',
  })
  async getAll(@Res() res: Response, @Query() query: ListAttendanceQueryDto): Promise<Response> {
    const response = await this.attendanceService.getByFilters(query);
    return res.status(response.statusCode).json(response);
  }

  @Post('/attendance-sheets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload or replace the attendance sheet for a company + month' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: AttendanceSheetResponseDto, description: 'Attendance sheet uploaded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadOrReplaceAttendanceSheet(
    @Res() res: Response,
    @Body() uploadAttendanceSheetDto: UploadAttendanceSheetDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<Response> {
    const response = await this.attendanceService.uploadAttendanceSheet(uploadAttendanceSheetDto, file);
    return res.status(response.statusCode).json(response);
  }

  @Get('/attendance-sheets')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List attendance sheets with filtering and pagination',
    description: 'Fetch all attendance sheets with optional filtering by companyId, month, or month range. Supports pagination and sorting. When both companyId and month are provided, returns single record (backward compatible).',
  })
  @ApiResponse({
    status: 200,
    type: AttendanceSheetListResponseDto,
    description: 'Attendance sheets retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - validation error' })
  async getAttendanceSheet(
    @Res() res: Response,
    @Query() query: ListAttendanceSheetsDto,
  ): Promise<Response> {
    const response = await this.attendanceService.listAttendanceSheets(query);
    return res.status(response.statusCode).json(response);
  }

  @Delete('/attendance-sheets/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete attendance sheet entry and file' })
  @ApiResponse({ status: 200, description: 'Attendance sheet deleted' })
  @ApiResponse({ status: 404, description: 'Sheet not found' })
  async deleteAttendanceSheetById(
    @Res() res: Response,
    @Param('id') id: string
  ): Promise<Response> {
    const response = await this.attendanceService.deleteAttendanceSheetById(id);
    return res.status(response.statusCode).json(response);
  }

  @Get('/reports')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Attendance monthly report dataset (JSON for UI/PDF)',
    description: 'Get aggregated attendance report data for a company and month. Includes company info, totals (employees, present days, averages), all attendance records with employee details, and attendance sheet URL. Perfect for UI rendering or PDF generation.',
  })
  @ApiQuery({
    name: 'companyId',
    description: 'Company ID (UUID format)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'month',
    description: 'Month in YYYY-MM format (e.g., 2025-10)',
    example: '2025-10',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Report data retrieved successfully',
    type: AttendanceReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request - missing or invalid parameters',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company or records not found',
    type: ApiErrorResponseDto,
  })
  async getAttendanceReport(
    @Res() res: Response,
    @Query('companyId') companyId: string,
    @Query('month') month: string
  ): Promise<Response> {
    const response = await this.attendanceService.getAttendanceReport(companyId, month);
    return res.status(response.statusCode).json(response);
  }

  @Get('/reports/pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Attendance monthly report (PDF stream)', description: 'Streams attendance report as PDF, same dataset as /reports.' })
  @ApiResponse({ status: 200, description: 'PDF attendance report', schema: { type: 'string', format: 'binary' } })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Company or records not found' })
  async getAttendanceReportPdf(
    @Res() res: Response,
    @Query('companyId') companyId: string,
    @Query('month') month: string,
  ): Promise<any> {
    return this.attendanceService.getAttendanceReportPdf(companyId, month, res);
  }

  @Get('employee/:employeeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve attendance records by employee',
    description: 'Retrieve attendance records by employee',
  })
  async getAttendanceRecordsByEmployeeId(
    @Res() res: Response,
    @Param('employeeId') employeeId: string,
  ): Promise<Response> {
    const response =
      await this.attendanceService.getAttendanceRecordsByEmployeeId(employeeId);
    return res.status(response.statusCode).json(response);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete Attendance',
    description: 'Delete attendance by ID',
  })
  async deleteAttendanceById(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<Response> {
    const response = await this.attendanceService.deleteAttendanceById(id);
    return res.status(response.statusCode).json(response);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete Multiple Attendances',
    description: 'Delete multiple attendance records',
  })
  async deleteMultipleAttendances(
    @Res() res: Response,
    @Body() deleteAttendanceDto: DeleteAttendanceDto,
  ): Promise<Response> {
    const response = await this.attendanceService.deleteMultipleAttendances(
      deleteAttendanceDto.ids,
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update presentCount for attendance record',
    description: 'Update the presentCount (number of days present) for an existing attendance record. Validates that the new count is within valid range for the month.',
  })
  @ApiParam({
    name: 'id',
    description: 'Attendance record ID (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    type: 'string',
  })
  @ApiBody({ type: UpdateAttendanceDto })
  @ApiResponse({
    status: 200,
    description: 'Attendance updated successfully',
    type: ApiResponseWrapperDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Attendance updated',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          employeeId: 'TSS1001',
          companyId: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
          month: '2025-10',
          presentCount: 18,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
    type: ApiErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'presentCount must be between 0 and 31 for 2025-10',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Attendance record not found',
    type: ApiErrorResponseDto,
  })
  async updateAttendance(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Response> {
    const response = await this.attendanceService.updateAttendance(id, updateAttendanceDto);
    return res.status(response.statusCode).json(response);
  }

  @Get('records-by-company/:companyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve attendance records by company',
    description: 'Retrieve attendance records by company',
  })
  async getAttendanceRecordsByCompanyId(
    @Res() res: Response,
    @Param('companyId') companyId: string,
  ): Promise<Response> {
    const response =
      await this.attendanceService.getAttendanceRecordsByCompanyId(companyId);
    return res.status(response.statusCode).json(response);
  }
}
