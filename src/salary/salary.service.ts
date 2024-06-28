import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AttendanceRepository } from 'src/attendance/attendance.repository';
import { EmployeeRepository } from 'src/employee/employee.repository';
import { CalculateSalaryDto } from './dto/calculate-salary.dto';

@Injectable()
export class SalaryService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly logger: Logger,
  ) {}

  // async calculateSalary(calculateSalaryDto: CalculateSalaryDto) {
  //   try {
  //     const { employeeId, month } = calculateSalaryDto;

  //     const employee = await this.employeeRepository.getEmployeeById(
  //       employeeId,
  //     );
  //     if (!employee) {
  //       throw new NotFoundException(`Employee with ID ${employeeId} not found`);
  //     }
  //     const attendanceCount =
  //       await this.attendanceRepository.getTotalAttendance({
  //         employeeId,
  //         month,
  //       });
  //     const presentCount = attendanceCount.presentCount;
  //     const totalDaysInMonth = this.getDaysInMonth(month);
  //     const dailySalary = employee.salary / totalDaysInMonth;
  //     const calculatedSalary = dailySalary * presentCount;

  //     return calculatedSalary;
  //   } catch (error) {
  //     this.logger.error(
  //       `Error calculating salaru of employee with ID: ${calculateSalaryDto.employeeId}`,
  //     );
  //     throw error;
  //   }
  // }

  private getDaysInMonth(month: string): number {
    const [year, monthIndex] = month.split('-').map(Number);
    return new Date(year, monthIndex, 0).getDate();
  }
}
