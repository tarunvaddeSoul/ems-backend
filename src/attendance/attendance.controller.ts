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
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteAttendanceDto } from './dto/delete-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAttendanceSheetDto } from './dto/upload-attendance-sheet.dto';
import { GetAttendanceByCompanyAndMonthDto } from './dto/get-attendance.dto';
import { GetActiveEmployeesDto } from './dto/get-active-employees.dto';
import { Response } from 'express';

@ApiTags('Attendance')
@UseInterceptors(TransformInterceptor)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mark attendance for an employee' })
  @ApiResponse({ status: 201, description: 'Attendance marked successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
    description: 'Mark attendance for multiple employees',
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

  @Get(':companyId')
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

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve attendance records',
    description: 'Retrieve attendance records',
  })
  async getAll(@Res() res: Response): Promise<Response> {
    const response = await this.attendanceService.getAll();
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
}
