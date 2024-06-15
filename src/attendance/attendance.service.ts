import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { AttendanceRepository } from './attendance.repository';
import { EmployeeRepository } from 'src/employee/employee.repository';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly logger: Logger,
    private readonly employeeRepository: EmployeeRepository,
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

  async getTotalAttendance(getAttendanceDto: GetAttendanceDto) {
    try {
      const employee = await this.employeeRepository.getEmployeeById(
        getAttendanceDto.employeeId,
      );
      if (!employee) {
        throw new NotFoundException(
          `Employee with ID: ${getAttendanceDto.employeeId} not found.`,
        );
      }
      const attendanceCount =
        await this.attendanceRepository.getTotalAttendance(getAttendanceDto);
      if (!attendanceCount) {
        throw new BadRequestException(
          `Error fetching attendance count of employee with ID: ${getAttendanceDto.employeeId}`,
        );
      }
      return {
        message: 'Attendance count fetched successfully',
        data: attendanceCount,
      };
    } catch (error) {
      this.logger.error(
        `Error getting attendance of employee with ID: ${getAttendanceDto.employeeId}`,
      );
      throw error;
    }
  }

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
      const attendances = await this.attendanceRepository.getAttendanceRecords(
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
