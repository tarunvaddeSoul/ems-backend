import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceRepository } from './attendance.repository';
import { EmployeeRepository } from 'src/employee/employee.repository';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { Attendance } from '@prisma/client';
import { CompanyRepository } from 'src/company/company.repository';
import { UploadAttendanceSheetDto } from './dto/upload-attendance-sheet.dto';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly logger: Logger,
    private readonly employeeRepository: EmployeeRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async markAttendance(markAttendanceDto: MarkAttendanceDto) {
    try {
      const employee = await this.employeeRepository.getEmployeeById(
        markAttendanceDto.employeeId,
      );
      if (!employee) {
        throw new NotFoundException(
          `Employee with ID: ${markAttendanceDto.employeeId} not found.`,
        );
      }
      const company = await this.companyRepository.findById(markAttendanceDto.companyId);
      if (!company) {
        throw new NotFoundException(
          `Company with ID ${markAttendanceDto.companyId} not found.`,
        );
      }
      // const folder = `attendance-sheets/${company.name}`;
      // const attendanceSheetUrl = await this.uploadFile(attendanceSheet, `${folder}/${markAttendanceDto.month}`);
      const markAttendanceResponse =
        await this.attendanceRepository.markAttendance(markAttendanceDto);
      if (!markAttendanceResponse) {
        throw new BadRequestException(
          `Error marking attendance of employee with ID: ${markAttendanceDto.employeeId}`,
        );
      }
      return {
        message: 'Marked attendance successfully',
        data: markAttendanceResponse,
      };
    } catch (error) {
      this.logger.error(
        `Error marking attendance of employee with ID: ${markAttendanceDto.employeeId}`,
      );
      throw error;
    }
  }

  async bulkMarkAttendance(
    bulkMarkAttendanceDto: BulkMarkAttendanceDto,
  ): Promise<{ message: string; data: Attendance[] }> {
    try {
      const { records } = bulkMarkAttendanceDto;
      const attendanceRecords: Attendance[] = [];

      // Extract all employee IDs from the records
      const employeeIds = records.map((record) => record.employeeId);

      // Find employees by IDs
      const employees = await this.employeeRepository.findMany(employeeIds);

      // Check if all employee records are found
      if (employees.length !== employeeIds.length) {
        throw new NotFoundException('Some employee records not found.');
      }

      for (const record of records) {
        const { employeeId, month, presentCount, companyId } = record;
        const attendanceRecord = await this.attendanceRepository.markAttendance(
          { employeeId, month, presentCount, companyId }
        );
        attendanceRecords.push(attendanceRecord);
      }
      return {
        message: 'Marked attendance successfully',
        data: attendanceRecords,
      };
    } catch (error) {
      this.logger.error(`Error marking attendance of employees`, error.stack);
      throw error;
    }
  }

  async uploadAttendanceSheet(uploadAttendanceSheetDto: UploadAttendanceSheetDto, attendanceSheet: Express.Multer.File) {
    try {
      const { companyId, month } = uploadAttendanceSheetDto;
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(
          `Company with ID ${companyId} not found.`,
        );
      }
      const folder = `attendance-sheets/${company.name}`;
      const attendanceSheetUrl = await this.uploadFile(attendanceSheet, `${folder}/${month}`);
      const saveAttendanceSheetResponse = await this.attendanceRepository.saveAttendanceSheet(uploadAttendanceSheetDto, attendanceSheetUrl);
      return {
        message: 'Attendance sheet uploaded successfully',
        data: saveAttendanceSheetResponse,
      }
    } catch (error) {
      this.logger.error(`Error in uploadAttendanceSheet`, error.stack);
      throw error;
    }
  }

  private async uploadFile(
    file: Express.Multer.File,
    folderPath: string,
  ): Promise<string | null> {
    if (file) {
      return await this.awsS3Service.uploadFile(file, folderPath);
    }
    return null;
  }

  async getAttendanceRecordsByCompanyId(companyId: string) {
    try {
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(
          `Company with ID ${companyId} not found.`,
        );
      }
      const attendanceRecords = await this.attendanceRepository.getAttendanceRecordsByCompanyId(companyId);
      if (attendanceRecords.length === 0) {
        throw new NotFoundException(
          `No attendance records found`,
        );
      }
      return {
        message: 'Attendance records retrieved successfully',
        data: attendanceRecords,
      };
    } catch (error) {
      this.logger.error(`Error retrieving attendance records`, error.stack);
      throw error;
    }
  }

  async getAttendanceRecordsByEmployeeId(employeeId: string) {
    try {
      const employee = await this.employeeRepository.getEmployeeById(employeeId);
      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${employee} not found.`,
        );
      }
      const attendanceRecords = await this.attendanceRepository.getAttendanceRecordsByEmployeeId(employeeId);
      if (attendanceRecords.length === 0) {
        throw new NotFoundException(
          `No attendance records found`,
        );
      }
      return {
        message: 'Attendance records retrieved successfully',
        data: attendanceRecords,
      };
    } catch (error) {
      this.logger.error(`Error retrieving attendance records`, error.stack);
      throw error;
    }
  }

  async getAll() {
    try {
      const attendanceRecords = await this.attendanceRepository.getAll();
      if (attendanceRecords.length === 0) {
        throw new NotFoundException(
          `No attendance records found`,
        );
      }
      return {
        message: 'Attendance records retrieved successfully',
        data: attendanceRecords,
      };
    } catch (error) {
      this.logger.error(`Error retrieving attendance records`, error.stack);
      throw error;
    }
  }

  // async getTotalAttendance(getAttendanceDto: GetAttendanceDto) {
  //   try {
  //     const employee = await this.employeeRepository.getEmployeeById(
  //       getAttendanceDto.employeeId,
  //     );
  //     if (!employee) {
  //       throw new NotFoundException(
  //         `Employee with ID: ${getAttendanceDto.employeeId} not found.`,
  //       );
  //     }
  //     const attendanceCount =
  //       await this.attendanceRepository.getTotalAttendance(getAttendanceDto);
  //     if (!attendanceCount) {
  //       throw new BadRequestException(
  //         `Error fetching attendance count of employee with ID: ${getAttendanceDto.employeeId}`,
  //       );
  //     }
  //     return {
  //       message: 'Attendance count fetched successfully',
  //       data: attendanceCount,
  //     };
  //   } catch (error) {
  //     this.logger.error(
  //       `Error getting attendance of employee with ID: ${getAttendanceDto.employeeId}`,
  //     );
  //     throw error;
  //   }
  // }

  async deleteAttendanceById(id: string) {
    try {
      const attendance = await this.attendanceRepository.getAttendanceById(id);
      if (!attendance) {
        throw new NotFoundException(
          `Attendance record with ID ${id} not found.`,
        );
      }
      const deleteResponse =
        await this.attendanceRepository.deleteAttendanceById(id);
      return {
        message: 'Attendance record deleted successfully',
        data: deleteResponse,
      };
    } catch (error) {
      this.logger.error(`Error in deleting attendance record of ID: ${id}`);
      throw error;
    }
  }

  async deleteMultipleAttendances(ids: string[]) {
    try {
      const attendances = await this.attendanceRepository.getAttendanceRecordsByIds(
        ids,
      );
      if (attendances.length !== ids.length) {
        throw new NotFoundException('Some attendance records not found.');
      }
      const deleteResponse = await this.attendanceRepository.deleteMany(ids);
      return {
        message: 'Attendance records deleted successfully',
        data: deleteResponse,
      };
    } catch (error) {
      this.logger.error(`Error deleting attendance records`);
      throw error;
    }
  }
}
