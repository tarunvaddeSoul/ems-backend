import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { Attendance } from '@prisma/client';
import { Status } from './enum/attendance-status.enum';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(
    markAttendanceDto: MarkAttendanceDto,
  ): Promise<Attendance> {
    try {
      const { employeeId, month, presentCount, companyId } = markAttendanceDto;
      const attendanceRecord = await this.prisma.attendance.upsert({
        where: {
          employeeId_companyId_month: {
            employeeId,
            companyId,
            month,
          },
        },
        update: {
          presentCount,
        },
        create: {
          employeeId,
          month,
          presentCount,
          companyId,
        },
      });
  
      return attendanceRecord;
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

  async markBulkAttendance(
    bulkMarkAttendanceDto: BulkMarkAttendanceDto,
  ): Promise<Attendance[]> {
    const attendanceRecords = [];

    for (const markAttendanceDto of bulkMarkAttendanceDto.records) {
      try {
        const { employeeId, month, presentCount } = markAttendanceDto;
        const attendanceRecord = await this.prisma.attendance.create({
          data: {
            employeeId,
            month,
            presentCount,
          },
        });
        attendanceRecords.push(attendanceRecord);
      } catch (error) {
        // Handle specific errors or log them as needed
        // Continue processing other records
      }
    }

    return attendanceRecords;
  }

  async getAttendanceRecordsByIds(ids: string[]) {
    try {
      const attendances = await this.prisma.attendance.findMany({
        where: { id: { in: ids } },
      });
      return attendances;
    } catch (error) {
      return error;
    }
  }

  async getAttendanceRecordsByCompanyId(companyId: string) {
    try {
      const attendanceRecords = await this.prisma.attendance.findMany({ where: { companyId } });
      return attendanceRecords;
    } catch (error) {
      return error;   
    }
  }

  async getAll() {
    try {
      const attendanceRecords = await this.prisma.attendance.findMany();
      return attendanceRecords;
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

    // async getTotalAttendance(
  //   getAttendanceDto: GetAttendanceDto,
  // ): Promise<{ presentCount: number; absentCount: number }> {
  //   try {
  //     const { employeeId, month } = getAttendanceDto;
  //     const [year, monthIndex] = month.split('-').map(Number);

  //     const startDate = new Date(year, monthIndex - 1, 1);
  //     const endDate = new Date(year, monthIndex, 0);
  //     // Count present days
  //     const presentCount = await this.prisma.attendance.count({
  //       where: {
  //         employeeId,
  //         date: {
  //           gte: startDate,
  //           lte: endDate,
  //         },
  //         status: 'PRESENT',
  //       },
  //     });

  //     // Count absent days
  //     const absentCount = await this.prisma.attendance.count({
  //       where: {
  //         employeeId,
  //         date: {
  //           gte: startDate,
  //           lte: endDate,
  //         },
  //         status: 'ABSENT',
  //       },
  //     });

  //     return { presentCount, absentCount };
  //   } catch (error) {
  //     return error;
  //   }
  // }
}
