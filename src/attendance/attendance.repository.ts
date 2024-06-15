import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { Attendance } from '@prisma/client';
import * as moment from 'moment-timezone';

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
  ): Promise<{ presentCount: number; absentCount: number }> {
    try {
      const { employeeId, month } = getAttendanceDto;
      const [year, monthIndex] = month.split('-').map(Number);

      // Correctly create the start and end dates in IST timezone
      const startDate = moment
        .tz(`${year}-${monthIndex}-01`, 'YYYY-MM-DD', 'Asia/Kolkata')
        .startOf('day')
        .toDate();
      const endDate = moment
        .tz(`${year}-${monthIndex}`, 'YYYY-MM', 'Asia/Kolkata')
        .endOf('month')
        .endOf('day')
        .toDate();

      // Count present days
      const presentCount = await this.prisma.attendance.count({
        where: {
          employeeId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PRESENT',
        },
      });

      // Count absent days
      const absentCount = await this.prisma.attendance.count({
        where: {
          employeeId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'ABSENT',
        },
      });

      return { presentCount, absentCount };
    } catch (error) {
      return error;
    }
  }

  async getAttendanceById(id: string) {
    try {
      const attendance = await this.prisma.attendance.findUnique({
        where: { id },
      });
      return attendance;
    } catch (error) {
      return error;
    }
  }

  async getAttendanceRecords(ids: string[]) {
    try {
      const attendances = await this.prisma.attendance.findMany({
        where: { id: { in: ids } },
      });
      return attendances;
    } catch (error) {
      return error;
    }
  }

  async deleteMany(ids: string[]) {
    try {
      const deleteManyResponse = await this.prisma.attendance.deleteMany({
        where: { id: { in: ids } },
      });
      return deleteManyResponse;
    } catch (error) {
      return error;
    }
  }

  async deleteAttendanceById(id: string) {
    try {
      const deleteResponse = await this.prisma.attendance.delete({
        where: { id },
      });
      return deleteResponse;
    } catch (error) {
      return error;
    }
  }
}
