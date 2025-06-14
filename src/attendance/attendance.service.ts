import {
  BadRequestException,
  HttpStatus,
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
import { IResponse } from 'src/types/response.interface';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly logger: Logger,
    private readonly employeeRepository: EmployeeRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async markAttendance(
    markAttendanceDto: MarkAttendanceDto,
  ): Promise<IResponse<any>> {
    try {
      const employee = await this.employeeRepository.getEmployeeById(
        markAttendanceDto.employeeId,
      );
      if (!employee) {
        throw new NotFoundException(
          `Employee with ID: ${markAttendanceDto.employeeId} not found.`,
        );
      }
      const company = await this.companyRepository.findById(
        markAttendanceDto.companyId,
      );
      if (!company) {
        throw new NotFoundException(
          `Company with ID ${markAttendanceDto.companyId} not found.`,
        );
      }
      const markAttendanceResponse =
        await this.attendanceRepository.markAttendance(markAttendanceDto);
      if (!markAttendanceResponse) {
        throw new BadRequestException(
          `Error marking attendance of employee with ID: ${markAttendanceDto.employeeId}`,
        );
      }
      return {
        statusCode: HttpStatus.OK,
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
  ): Promise<IResponse<Attendance[]>> {
    try {
      const { records } = bulkMarkAttendanceDto;
      const attendanceRecords: Attendance[] = [];
      const employeeIds = records.map((record) => record.employeeId);
      const employees = await this.employeeRepository.findMany(employeeIds);

      if (employees.length !== employeeIds.length) {
        throw new NotFoundException('Some employee records not found.');
      }

      for (const record of records) {
        const { employeeId, month, presentCount, companyId } = record;
        const attendanceRecord = await this.attendanceRepository.markAttendance(
          { employeeId, month, presentCount, companyId },
        );
        attendanceRecords.push(attendanceRecord);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Marked attendance successfully',
        data: attendanceRecords,
      };
    } catch (error) {
      this.logger.error(`Error marking attendance of employees`, error.stack);
      throw error;
    }
  }

  async uploadAttendanceSheet(
    uploadAttendanceSheetDto: UploadAttendanceSheetDto,
    attendanceSheet: Express.Multer.File,
  ): Promise<IResponse<any>> {
    try {
      const { companyId, month } = uploadAttendanceSheetDto;
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found.`);
      }
      const folder = `attendance-sheets/${company.name}`;
      const attendanceSheetUrl = await this.uploadFile(
        attendanceSheet,
        `${folder}/${month}`,
      );
      const saveAttendanceSheetResponse =
        await this.attendanceRepository.saveAttendanceSheet(
          uploadAttendanceSheetDto,
          attendanceSheetUrl,
        );
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance sheet uploaded successfully',
        data: saveAttendanceSheetResponse,
      };
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

  async getAttendanceRecordsByCompanyId(
    companyId: string,
  ): Promise<IResponse<any>> {
    try {
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found.`);
      }
      const attendanceRecords =
        await this.attendanceRepository.getAttendanceRecordsByCompanyId(
          companyId,
        );
      if (attendanceRecords.length === 0) {
        throw new NotFoundException(`No attendance records found`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance records retrieved successfully',
        data: attendanceRecords,
      };
    } catch (error) {
      this.logger.error(`Error retrieving attendance records`, error.stack);
      throw error;
    }
  }

  async getAttendanceRecordsByEmployeeId(
    employeeId: string,
  ): Promise<IResponse<any>> {
    try {
      const employee = await this.employeeRepository.getEmployeeById(
        employeeId,
      );
      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${employeeId} not found.`,
        );
      }
      const attendanceRecords =
        await this.attendanceRepository.getAttendanceRecordsByEmployeeId(
          employeeId,
        );
      if (attendanceRecords.length === 0) {
        throw new NotFoundException(`No attendance records found`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance records retrieved successfully',
        data: attendanceRecords,
      };
    } catch (error) {
      this.logger.error(`Error retrieving attendance records`, error.stack);
      throw error;
    }
  }

  async getAll(): Promise<IResponse<any>> {
    try {
      const attendanceRecords = await this.attendanceRepository.getAll();
      if (attendanceRecords.length === 0) {
        throw new NotFoundException(`No attendance records found`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance records retrieved successfully',
        data: attendanceRecords,
      };
    } catch (error) {
      this.logger.error(`Error retrieving attendance records`, error.stack);
      throw error;
    }
  }

  async getAllAttendanceRecordsByCompanyIdAndMonth(
    companyId: string,
    month: string,
  ): Promise<IResponse<any>> {
    try {
      const attendanceRecords =
        await this.attendanceRepository.getAllAttendanceRecordsByCompanyIdAndMonth(
          companyId,
          month,
        );

      if (attendanceRecords.length === 0) {
        throw new NotFoundException(`No attendance records found`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance records retrieved successfully',
        data: attendanceRecords,
      };
    } catch (error) {
      this.logger.error(`Error retrieving attendance records`, error.stack);
      throw error;
    }
  }

  async deleteAttendanceById(id: string): Promise<IResponse<any>> {
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
        statusCode: HttpStatus.OK,
        message: 'Attendance record deleted successfully',
        data: deleteResponse,
      };
    } catch (error) {
      this.logger.error(`Error in deleting attendance record of ID: ${id}`);
      throw error;
    }
  }

  async deleteMultipleAttendances(ids: string[]): Promise<IResponse<any>> {
    try {
      const attendances =
        await this.attendanceRepository.getAttendanceRecordsByIds(ids);
      if (attendances.length !== ids.length) {
        throw new NotFoundException('Some attendance records not found.');
      }
      const deleteResponse = await this.attendanceRepository.deleteMany(ids);
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance records deleted successfully',
        data: deleteResponse,
      };
    } catch (error) {
      this.logger.error(`Error deleting attendance records`);
      throw error;
    }
  }
}
