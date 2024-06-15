import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { Attendance } from '@prisma/client';
import { Status } from './enum/attendance-status.enum';

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

      const startDate = new Date(year, monthIndex - 1, 1);
      const endDate = new Date(year, monthIndex, 0);
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

  async createMany(employeeIds: string[], dateObject: Date, status: Status) {
    try {
      const attendances = await this.prisma.attendance.createMany({
        data: employeeIds.map((employeeId) => ({
          employeeId,
          date: dateObject,
          status,
        })),
      });
      return attendances;
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
