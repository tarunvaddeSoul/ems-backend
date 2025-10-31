import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { Attendance } from '@prisma/client';
import { UploadAttendanceSheetDto } from './dto/upload-attendance-sheet.dto';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(
    markAttendanceDto: MarkAttendanceDto,
    // attendanceSheetUrl: string
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
          // attendanceSheetUrl,
        },
        create: {
          employeeId,
          month,
          presentCount,
          companyId,
          // attendanceSheetUrl,
        },
      });

      return attendanceRecord;
    } catch (error) {
      return error;
    }
  }

  async bulkMarkAttendance(records: MarkAttendanceDto[]): Promise<Attendance[]> {
    try {
      // Use a transaction to ensure all records are created atomically
      return await this.prisma.$transaction(
        records.map((record) =>
          this.prisma.attendance.upsert({
            where: {
              employeeId_companyId_month: {
                employeeId: record.employeeId,
                companyId: record.companyId,
                month: record.month,
              },
            },
            update: {
              presentCount: record.presentCount,
            },
            create: {
              employeeId: record.employeeId,
              month: record.month,
              presentCount: record.presentCount,
              companyId: record.companyId,
            },
          }),
        ),
      );
    } catch (error) {
      throw error;
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

  async saveAttendanceSheet(
    uploadAttendanceSheetDto: UploadAttendanceSheetDto,
    attendanceSheetUrl: string,
  ) {
    try {
      const { companyId, month } = uploadAttendanceSheetDto;
      const saveAttendanceSheetResponse =
        await this.prisma.attendanceSheet.upsert({
          where: {
            companyId_month: {
              companyId,
              month,
            },
          },
          update: {
            attendanceSheetUrl,
          },
          create: {
            companyId,
            month,
            attendanceSheetUrl,
          },
        });
      return saveAttendanceSheetResponse;
    } catch (error) {
      return error;
    }
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
      const attendanceRecords = await this.prisma.attendance.findMany({
        where: { companyId },
      });
      return attendanceRecords;
    } catch (error) {
      return error;
    }
  }

  async getAttendanceRecordsByEmployeeId(employeeId: string) {
    try {
      const attendanceRecords = await this.prisma.attendance.findMany({
        where: { employeeId },
      });
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

  async updateAttendance(id: string, presentCount: number) {
    try {
      return await this.prisma.attendance.update({
        where: { id },
        data: { presentCount },
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllAttendanceRecordsByCompanyIdAndMonth(
    companyId: string,
    month: string,
  ): Promise<any[]> {
    try {
      const attendanceRecords = await this.prisma.attendance.findMany({
        where: {
          companyId: companyId,
          month: month,
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employmentHistories: {
                where: {
                  companyId: companyId,
                },
                orderBy: {
                  joiningDate: 'desc',
                },
                take: 1,
                select: {
                  designation: {
                    select: {
                      name: true,
                    },
                  },
                  department: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      if (attendanceRecords.length === 0) {
        throw new NotFoundException(
          `No attendance records found for company ${companyId} and month ${month}`,
        );
      }

      const attendanceSheet = await this.prisma.attendanceSheet.findUnique({
        where: {
          companyId_month: {
            companyId,
            month,
          },
        },
      });

      return attendanceRecords.map((record) => ({
        employeeID: record.employee.id,
        employeeName: `${record.employee.firstName} ${record.employee.lastName}`,
        companyName: record.company?.name || 'Unknown Company',
        designationName:
          record.employee.employmentHistories[0]?.designation.name ||
          'Unknown Designation',
        departmentName:
          record.employee.employmentHistories[0]?.department.name ||
          'Unknown Department',
        presentCount: record.presentCount,
        attendanceSheetUrl: attendanceSheet?.attendanceSheetUrl ?? null,
      }));
    } catch (error) {
      throw error;
    }
  }

  async getAttendanceSheetByCompanyAndMonth(companyId: string, month: string) {
    try {
      return await this.prisma.attendanceSheet.findUnique({
        where: { companyId_month: { companyId, month } },
      });
    } catch (error) {
      throw error;
    }
  }
  async getAttendanceSheetById(id: string) {
    try {
      return await this.prisma.attendanceSheet.findUnique({ where: { id } });
    } catch (error) {
      throw error;
    }
  }
  async deleteAttendanceSheetById(id: string) {
    try {
      return await this.prisma.attendanceSheet.delete({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async getAttendanceByFilters(filters: { companyId?: string; employeeId?: string; month?: string }) {
    try {
      const { companyId, employeeId, month } = filters;
      const where: any = {};
      if (companyId) where.companyId = companyId;
      if (employeeId) where.employeeId = employeeId;
      if (month) where.month = month;

      const attendanceRecords = await this.prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employmentHistories: {
                where: companyId ? { companyId } : undefined,
                orderBy: { joiningDate: 'desc' },
                take: 1,
                select: {
                  designation: { select: { name: true } },
                  department: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      return attendanceRecords.map((rec) => ({
        id: rec.id,
        employeeId: rec.employeeId,
        companyId: rec.companyId,
        month: rec.month,
        presentCount: rec.presentCount,
        employeeName: `${rec.employee.firstName} ${rec.employee.lastName}`.trim(),
        employeeID: rec.employee.id,
        departmentName: rec.employee.employmentHistories[0]?.department?.name || null,
        designationName: rec.employee.employmentHistories[0]?.designation?.name || null,
      }));
    } catch (error) {
      throw error;
    }
  }
}
