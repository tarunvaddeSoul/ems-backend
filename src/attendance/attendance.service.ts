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
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceReportResponseDto } from './dto/attendance-report-response.dto';
import { ListAttendanceQueryDto } from './dto/list-attendance-query.dto';
import { ListAttendanceSheetsDto } from './dto/list-attendance-sheets.dto';

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

      // validate days range
      const maxDays = this.getDaysInMonth(markAttendanceDto.month);
      if (markAttendanceDto.presentCount < 0 || markAttendanceDto.presentCount > maxDays) {
        throw new BadRequestException(`presentCount must be between 0 and ${maxDays} for ${markAttendanceDto.month}`);
      }

      const markAttendanceResponse =
        await this.attendanceRepository.markAttendance(markAttendanceDto);
      if (!markAttendanceResponse) {
        throw new BadRequestException(
          `Error marking attendance of employee with ID: ${markAttendanceDto.employeeId}`,
        );
      }
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Attendance marked',
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

      // per-record daysInMonth validation
      for (const r of records) {
        const maxDays = this.getDaysInMonth(r.month);
        if (r.presentCount < 0 || r.presentCount > maxDays) {
          throw new BadRequestException(`Employee ${r.employeeId} month ${r.month}: presentCount must be between 0 and ${maxDays}`);
        }
      }

      // Use batch operation for better performance
      const attendanceRecords =
        await this.attendanceRepository.bulkMarkAttendance(records);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Bulk attendance processed',
        data: attendanceRecords as any,
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
      if (!attendanceSheet) {
        throw new BadRequestException('file is required');
      }
      const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      const maxBytes = 10 * 1024 * 1024; // 10 MB
      if (!allowed.includes(attendanceSheet.mimetype)) {
        throw new BadRequestException('Unsupported file type');
      }
      if (attendanceSheet.size > maxBytes) {
        throw new BadRequestException('File too large');
      }

      // Check for existing sheet and delete old file if exists
      const existingSheet = await this.attendanceRepository.getAttendanceSheetByCompanyAndMonth(
        companyId,
        month,
      );
      if (existingSheet && existingSheet.attendanceSheetUrl) {
        // Extract S3 key from URL and delete old file
        const oldKey = this.extractS3KeyFromUrl(existingSheet.attendanceSheetUrl);
        if (oldKey) {
          try {
            await this.awsS3Service.deleteFile(oldKey);
          } catch (deleteError) {
            this.logger.warn(`Failed to delete old file from S3: ${deleteError.message}`);
            // Continue with upload even if deletion fails
          }
        }
      }

      // Upload new file
      const folder = `attendance-sheets/${company.name}`;
      const attendanceSheetUrl = await this.uploadFile(
        attendanceSheet,
        `${folder}/${month}`,
      );
      
      // Save/update database record
      const saveAttendanceSheetResponse =
        await this.attendanceRepository.saveAttendanceSheet(
          uploadAttendanceSheetDto,
          attendanceSheetUrl,
        );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Attendance sheet uploaded',
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

  private extractS3KeyFromUrl(url: string): string | null {
    try {
      // Handle different S3 URL formats:
      // https://bucket-name.s3.amazonaws.com/key/path
      // https://bucket-name.s3.region.amazonaws.com/key/path
      // https://s3.amazonaws.com/bucket-name/key/path
      const urlObj = new URL(url);
      
      // Pattern 1: https://bucket.s3.amazonaws.com/key
      if (urlObj.hostname.includes('.s3.amazonaws.com')) {
        return urlObj.pathname.substring(1); // Remove leading '/'
      }
      
      // Pattern 2: https://s3.amazonaws.com/bucket/key
      if (urlObj.hostname === 's3.amazonaws.com') {
        const parts = urlObj.pathname.split('/');
        if (parts.length > 2) {
          return parts.slice(2).join('/'); // Remove /bucket from path
        }
      }
      
      // Pattern 3: https://bucket.s3.region.amazonaws.com/key
      if (urlObj.hostname.includes('.s3.') && urlObj.hostname.includes('.amazonaws.com')) {
        return urlObj.pathname.substring(1);
      }
      
      // If URL format doesn't match, try to extract from pathname
      return urlObj.pathname.substring(1) || null;
    } catch (error) {
      this.logger.warn(`Failed to extract S3 key from URL: ${url}`);
      return null;
    }
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

  async updateAttendance(
    id: string,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<IResponse<any>> {
    try {
      const attendance = await this.attendanceRepository.getAttendanceById(id);
      if (!attendance) {
        throw new NotFoundException(`Attendance record with ID ${id} not found.`);
      }
      if (typeof updateAttendanceDto.presentCount === 'number') {
        const maxDays = this.getDaysInMonth(attendance.month);
        if (updateAttendanceDto.presentCount < 0 || updateAttendanceDto.presentCount > maxDays) {
          throw new BadRequestException(`presentCount must be between 0 and ${maxDays} for ${attendance.month}`);
        }
      }
      const updated = await this.attendanceRepository.updateAttendance(id, attendance.presentCount);
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance updated',
        data: updated,
      };
    } catch (error) {
      this.logger.error(`Error updating attendance with ID: ${id}`);
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

  async getAttendanceSheetByCompanyAndMonth(companyId: string, month: string): Promise<IResponse<any>> {
    try {
      if (!companyId || !month) {
        throw new BadRequestException('companyId and month are required');
      }
      const sheet = await this.attendanceRepository.getAttendanceSheetByCompanyAndMonth(companyId, month);
      if (!sheet) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No sheet found',
          data: null,
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: sheet,
      };
    } catch (error) {
      this.logger.error(`Error fetching attendance sheet by company and month`);
      throw error;
    }
  }

  async listAttendanceSheets(query: ListAttendanceSheetsDto): Promise<IResponse<any>> {
    try {
      // Validation: month cannot be used with startMonth/endMonth
      if (query.month && (query.startMonth || query.endMonth)) {
        throw new BadRequestException('month cannot be used with startMonth or endMonth');
      }

      // Validation: startMonth must be <= endMonth
      if (query.startMonth && query.endMonth) {
        if (query.startMonth > query.endMonth) {
          throw new BadRequestException('startMonth must be less than or equal to endMonth');
        }
      }

      // If both companyId and month are provided, return single record (backward compatibility)
      if (query.companyId && query.month) {
        const sheet = await this.attendanceRepository.getAttendanceSheetByCompanyAndMonth(
          query.companyId,
          query.month,
        );
        if (!sheet) {
          return {
            statusCode: HttpStatus.OK,
            message: 'No sheet found',
            data: null,
          };
        }

        // Get company name
        const company = await this.companyRepository.findById(query.companyId);
        return {
          statusCode: HttpStatus.OK,
          message: 'OK',
          data: {
            id: sheet.id,
            companyId: sheet.companyId,
            companyName: company?.name || 'Unknown',
            month: sheet.month,
            attendanceSheetUrl: sheet.attendanceSheetUrl,
          },
        };
      }

      // Otherwise, use list endpoint with pagination
      const result = await this.attendanceRepository.listAttendanceSheets(query);
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance sheets retrieved successfully',
        data: {
          data: result.data,
          pagination: result.pagination,
        },
      };
    } catch (error) {
      this.logger.error(`Error listing attendance sheets`, error.stack);
      throw error;
    }
  }

  async deleteAttendanceSheetById(id: string): Promise<IResponse<any>> {
    try {
      // find the sheet and delete the file from S3
      const sheet = await this.attendanceRepository.getAttendanceSheetById(id);
      if (!sheet) {
        throw new NotFoundException(`Attendance sheet not found`);
      }
      // delete file from storage if url present
      if (sheet.attendanceSheetUrl) {
        await this.awsS3Service.deleteFile(sheet.attendanceSheetUrl);
      }
      await this.attendanceRepository.deleteAttendanceSheetById(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance sheet deleted',
        data: null,
      };
    } catch (error) {
      this.logger.error(`Error deleting attendance sheet: ${id}`);
      throw error;
    }
  }

  async getAttendanceReport(companyId: string, month: string): Promise<IResponse<AttendanceReportResponseDto | null>> {
    try {
      if (!companyId || !month) {
        throw new BadRequestException('companyId and month are required');
      }
      // Fetch company
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      // Fetch attendance records for company+month
      const attendanceRecords = await this.attendanceRepository.getAllAttendanceRecordsByCompanyIdAndMonth(companyId, month);
      // Pull minimal info for report (normalize for DTO)
      const records = (attendanceRecords || []).map((row: any) => ({
        employeeId: row.employeeID,
        employeeName: row.employeeName,
        employeeID: row.employeeID, // Map as per API sample
        departmentName: row.departmentName,
        designationName: row.designationName,
        presentCount: row.presentCount, // Already validated
      }));
      // Compute stats
      const totalEmployees = records.length;
      const totalPresent = records.reduce((sum, r) => sum + (r.presentCount || 0), 0);
      const averageAttendance = totalEmployees ? totalPresent / totalEmployees : 0;
      const presentCountsArr = records.map((r) => r.presentCount);
      const minPresent = presentCountsArr.length ? Math.min(...presentCountsArr) : 0;
      const maxPresent = presentCountsArr.length ? Math.max(...presentCountsArr) : 0;
      // Get attendanceSheet
      const attendanceSheetObj = await this.attendanceRepository.getAttendanceSheetByCompanyAndMonth(companyId, month);
      const attendanceSheet = attendanceSheetObj
        ? { id: attendanceSheetObj.id, attendanceSheetUrl: attendanceSheetObj.attendanceSheetUrl }
        : null;
      // Company minimal DTO
      const companyReport = {
        id: company.id,
        name: company.name,
        address: company.address,
      };
      const report: AttendanceReportResponseDto = {
        company: companyReport,
        month,
        totals: { totalEmployees, totalPresent, averageAttendance, minPresent, maxPresent },
        records,
        attendanceSheet,
      };
      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: report,
      };
    } catch (error) {
      this.logger.error('Error generating attendance report', error.stack);
      throw error;
    }
  }

  async getAttendanceReportPdf(companyId: string, month: string, res: any): Promise<any> {
    // Stub for now: send JSON error or placeholder.
    return res.status(400).json({ statusCode: 400, message: 'Invalid request', data: null });
  }

  async getByFilters(query: ListAttendanceQueryDto): Promise<IResponse<any>> {
    try {
      const data = await this.attendanceRepository.getAttendanceByFilters(query);
      return { statusCode: HttpStatus.OK, message: 'OK', data };
    } catch (error) {
      this.logger.error('Error retrieving attendance by filters', error.stack);
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

  private getDaysInMonth(month: string): number {
    const [y, m] = month.split('-').map(Number);
    if (!y || !m) return 31;
    return new Date(y, m, 0).getDate();
  }
}
