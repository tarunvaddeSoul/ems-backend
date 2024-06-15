import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Attendance')
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

  @HttpCode(HttpStatus.OK)
  @Get('total')
  @ApiOperation({ summary: 'Get total attendance for an employee by month' })
  @ApiResponse({
    status: 200,
    description: 'Total attendance retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getTotalAttendance(@Query() getAttendanceDto: GetAttendanceDto) {
    const totalAttendance = await this.attendanceService.getTotalAttendance(
      getAttendanceDto,
    );
    return totalAttendance;
  }
}
