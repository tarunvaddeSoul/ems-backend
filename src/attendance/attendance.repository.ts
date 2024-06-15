import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { Attendance } from '@prisma/client';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(
    markAttendanceDto: MarkAttendanceDto,
  ): Promise<Attendance> {
    try {
      const { employeeId, date, status } = markAttendanceDto;
      const attendanceRecord = await this.prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(date),
          status,
        },
      });
      return attendanceRecord;
    } catch (error) {
      return error;
    }
  }

  async getTotalAttendance(
    getAttendanceDto: GetAttendanceDto,
  ): Promise<number> {
    try {
      const { employeeId, month } = getAttendanceDto;
      const [year, monthIndex] = month.split('-').map(Number);

      const startDate = new Date(year, monthIndex - 1, 1);
      const endDate = new Date(year, monthIndex, 0);

      const attendanceCount = await this.prisma.attendance.count({
        where: {
          employeeId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PRESENT',
        },
      });
      return attendanceCount;
    } catch (error) {
      return error;
    }
  }
}
