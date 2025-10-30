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
import { Attendance, Status } from '@prisma/client';
import { CompanyRepository } from 'src/company/company.repository';
import { UploadAttendanceSheetDto } from './dto/upload-attendance-sheet.dto';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { IResponse } from 'src/types/response.interface';
import { GetActiveEmployeesDto } from './dto/get-active-employees.dto';

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

      // Validate employee was active in the company during the attendance month
      await this.validateEmployeeEmploymentForMonth(
        markAttendanceDto.employeeId,
        markAttendanceDto.companyId,
        markAttendanceDto.month,
      );

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
      const employeeIds = records.map((record) => record.employeeId);
      const employees = await this.employeeRepository.findMany(employeeIds);

      if (employees.length !== employeeIds.length) {
        throw new NotFoundException('Some employee records not found.');
      }

      // Validate all employee-company-month combinations
      const validationErrors: string[] = [];
      for (const record of records) {
        try {
          await this.validateEmployeeEmploymentForMonth(
            record.employeeId,
            record.companyId,
            record.month,
          );
        } catch (error) {
          validationErrors.push(
            `Employee ${record.employeeId} for month ${record.month}: ${error.message}`,
          );
        }
      }

      if (validationErrors.length > 0) {
        throw new BadRequestException(
          `Validation failed for some records:\n${validationErrors.join('\n')}`,
        );
      }

      // Use batch operation for better performance
      const attendanceRecords =
        await this.attendanceRepository.bulkMarkAttendance(records);

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

  /**
   * Get active employees for a specific company and month
   * Returns employees who were active (employed) during the given month
   */
  async getActiveEmployeesForMonth(
    getActiveEmployeesDto: GetActiveEmployeesDto,
  ): Promise<IResponse<any>> {
    try {
      const { companyId, month } = getActiveEmployeesDto;

      // Validate company exists
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(
          `Company with ID ${companyId} not found.`,
        );
      }

      // Get active employees for the month
      const activeEmployees =
        await this.employeeRepository.getActiveEmployeesForMonth(
          companyId,
          month,
        );

      return {
        statusCode: HttpStatus.OK,
        message: `Active employees for ${month} retrieved successfully`,
        data: {
          companyId,
          companyName: company.name,
          month,
          employees: activeEmployees,
          count: activeEmployees.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving active employees for month`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Validates that an employee was active (employed) in the company during the given month
   * @throws BadRequestException if validation fails
   */
  private async validateEmployeeEmploymentForMonth(
    employeeId: string,
    companyId: string,
    month: string, // Format: YYYY-MM
  ): Promise<void> {
    // Parse the month to get first and last day
    const [year, monthNum] = month.split('-').map(Number);
    const monthStart = new Date(year, monthNum - 1, 1); // First day of month
    const monthEnd = new Date(year, monthNum, 0); // Last day of month

    // Get employment history for this employee and company
    const employmentHistory =
      await this.employeeRepository.getEmploymentHistoryForCompany(
        employeeId,
        companyId,
      );

    if (!employmentHistory || employmentHistory.length === 0) {
      throw new BadRequestException(
        `Employee ${employeeId} is not associated with company ${companyId}`,
      );
    }

    // Check if any employment period overlaps with the attendance month
    const isActiveInMonth = employmentHistory.some((employment) => {
      // Parse joining date (assuming format DD-MM-YYYY)
      const joiningDateParts = employment.joiningDate.split('-').map(Number);
      const joiningDate = new Date(
        joiningDateParts[2],
        joiningDateParts[1] - 1,
        joiningDateParts[0],
      );

      // Parse leaving date if it exists (assuming format DD-MM-YYYY)
      let leavingDate: Date | null = null;
      if (employment.leavingDate) {
        const leavingDateParts = employment.leavingDate.split('-').map(Number);
        leavingDate = new Date(
          leavingDateParts[2],
          leavingDateParts[1] - 1,
          leavingDateParts[0],
        );
      }

      // Employee must have joined before or during the month
      const joinedBeforeOrDuringMonth = joiningDate <= monthEnd;

      // Employee must not have left before the month started (or still be active)
      const leftAfterMonthStarted =
        !leavingDate || leavingDate >= monthStart;

      return joinedBeforeOrDuringMonth && leftAfterMonthStarted;
    });

    if (!isActiveInMonth) {
      throw new BadRequestException(
        `Employee ${employeeId} was not active in company ${companyId} during month ${month}. Cannot mark attendance for months before joining date or after leaving date.`,
      );
    }
  }
}
