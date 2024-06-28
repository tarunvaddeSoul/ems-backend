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
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteAttendanceDto } from './dto/delete-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { TransformInterceptor } from 'src/common/transform-interceptor';

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
    @Body() bulkMarkAttendanceDto: BulkMarkAttendanceDto,
  ) {
    return await this.attendanceService.bulkMarkAttendance(bulkMarkAttendanceDto);
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

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve attendance records',
    description: 'Retrieve attendance records',
  })
  async getAll() {
    return await this.attendanceService.getAll();
  }

  // @HttpCode(HttpStatus.OK)
  // @Get('total')
  // @ApiOperation({ summary: 'Get total attendance for an employee by month' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Total attendance retrieved successfully.',
  // })
  // @ApiResponse({ status: 400, description: 'Bad Request.' })
  // async getTotalAttendance(@Query() getAttendanceDto: GetAttendanceDto) {
  //   const totalAttendance = await this.attendanceService.getTotalAttendance(
  //     getAttendanceDto,
  //   );
  //   return totalAttendance;
  // }

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
