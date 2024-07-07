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
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteAttendanceDto } from './dto/delete-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAttendanceSheetDto } from './dto/upload-attendance-sheet.dto';
import { GetAttendanceByCompanyAndMonthDto } from './dto/get-attendance.dto';

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
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileInterceptor('attendanceSheet'))
  async markAttendance(@Body() markAttendanceDto: MarkAttendanceDto) {
    const attendance = await this.attendanceService.markAttendance(
      markAttendanceDto,
    );
    return attendance;
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bulk Mark Attendance',
    description: 'Mark attendance for multiple employees',
  })
  async bulkMarkAttendance(
    @Body() bulkMarkAttendanceDto: BulkMarkAttendanceDto
  ) {
    return await this.attendanceService.bulkMarkAttendance(bulkMarkAttendanceDto);
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
    @Body() uploadAttendanceSheetDto: UploadAttendanceSheetDto,
    @UploadedFile() attendanceSheet?: Express.Multer.File
  ) {
    return await this.attendanceService.uploadAttendanceSheet(uploadAttendanceSheetDto, attendanceSheet);
  }


  @HttpCode(HttpStatus.OK)
  @Get('records-by-company-and-month')
  @ApiOperation({ summary: 'Get total attendance for a company by month' })
  @ApiResponse({
    status: 200,
    description: 'Total attendance retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getAllAttendanceRecordsByCompanyIdAndMonth(@Query() queryParams: GetAttendanceByCompanyAndMonthDto) {
    const { companyId, month } = queryParams;
    return this.attendanceService.getAllAttendanceRecordsByCompanyIdAndMonth(companyId, month);
  }

  @Get(':companyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve attendance records by company',
    description: 'Retrieve attendance records by company',
  })
  async getAttendanceRecordsByCompanyId(@Param('companyId') companyId: string) {
    return await this.attendanceService.getAttendanceRecordsByCompanyId(companyId);
  }


  @Get('employee/:employeeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve attendance records by employee',
    description: 'Retrieve attendance records by employee',
  })
  async getAttendanceRecordsByEmployeeId(@Param('employeeId') employeeId: string) {
    return await this.attendanceService.getAttendanceRecordsByEmployeeId(employeeId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve attendance records',
    description: 'Retrieve attendance records',
  })
  async getAll() {
    return await this.attendanceService.getAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete Attendance',
    description: 'Delete attendance by ID',
  })
  async deleteAttendanceById(@Param('id') id: string) {
    await this.attendanceService.deleteAttendanceById(id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete Multiple Attendances',
    description: 'Delete multiple attendance records',
  })
  async deleteMultipleAttendances(
    @Body() deleteAttendanceDto: DeleteAttendanceDto,
  ) {
    return await this.attendanceService.deleteMultipleAttendances(
      deleteAttendanceDto.ids,
    );
  }
}
