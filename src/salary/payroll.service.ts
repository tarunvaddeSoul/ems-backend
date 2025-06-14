import {
  Injectable,
  Logger,
  NotFoundException,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Employee, SalaryTemplate, EmploymentHistory } from '@prisma/client';
import { CompanyRepository } from 'src/company/company.repository';
import { SalaryFieldPurpose } from 'src/company/enum/company.enum';
import { EmployeeRepository } from 'src/employee/employee.repository';
import { IResponse } from 'src/types/response.interface';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
import { PayrollRepository } from './payroll.repository';
import { endOfMonth } from 'date-fns';
import { FinalizePayrollDto } from './dto/finalize-payroll.dto';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    private readonly payrollRepository: PayrollRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async calculatePayroll(data: CalculatePayrollDto): Promise<IResponse<any>> {
    try {
      const { companyId, payrollMonth, adminInputs } = data;

      // Validate company exists
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      // Get company's salary template
      const salaryTemplate =
        await this.payrollRepository.getSalaryTemplateByCompany(companyId);
      if (!salaryTemplate) {
        throw new NotFoundException(
          `Salary template for company ID ${companyId} not found`,
        );
      }

      // Get employees working for this company
      const employees = await this.employeeRepository.findEmployeesByCompany(
        companyId,
      );
      if (!employees.length) {
        throw new NotFoundException(
          `No employees found for company ID ${companyId}`,
        );
      }

      // Parse salary template to get basic duty
      const templateConfig = this.parseSalaryTemplateConfig(salaryTemplate);
      const basicDuty = this.getBasicDutyFromTemplate(templateConfig);

      // Validate admin inputs for custom fields
      if (templateConfig.customFields?.length) {
        this.validateAdminInputsForCustomFields(
          employees,
          templateConfig.customFields,
          adminInputs,
        );
      }

      // Process payroll for all employees
      const payrollResults = await this.processPayrollCalculation(
        companyId,
        employees,
        salaryTemplate,
        payrollMonth,
        basicDuty,
        adminInputs,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Payroll calculated successfully',
        data: {
          companyName: company.name,
          payrollMonth,
          totalEmployees: employees.length,
          payrollResults,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to calculate payroll: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to calculate payroll due to an unexpected error',
      );
    }
  }

  async finalizePayroll(data: FinalizePayrollDto): Promise<IResponse<any>> {
    try {
      const { companyId, payrollMonth, payrollRecords } = data;

      // Validate company exists
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      // Validate records
      if (!Array.isArray(payrollRecords) || payrollRecords.length === 0) {
        throw new BadRequestException('No payroll records provided');
      }

      // Save each payroll record
      for (const record of payrollRecords) {
        const { employeeId, salary } = record;
        if (!employeeId || !salary) {
          throw new BadRequestException(
            'Each record must have employeeId and salary',
          );
        }
        await this.payrollRepository.saveSalaryRecord(
          employeeId,
          companyId,
          company.name,
          payrollMonth,
          salary,
        );
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Payroll finalized and saved successfully',
        data: {
          companyId,
          payrollMonth,
          totalRecords: payrollRecords.length,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to finalize payroll: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to finalize payroll due to an unexpected error',
      );
    }
  }

  async getPastPayrolls(
    companyId: string,
    page = 1,
    limit = 10,
  ): Promise<IResponse<any>> {
    try {
      // Validate company exists
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      const pastPayrolls = await this.payrollRepository.getPastPayrolls(
        companyId,
        page,
        limit,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Past payrolls retrieved successfully',
        data: {
          companyName: company.name,
          ...pastPayrolls,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to get past payrolls: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve past payrolls due to an unexpected error',
      );
    }
  }

  async getPayrollReport(params: {
    companyId?: string;
    employeeId?: string;
    startMonth?: string;
    endMonth?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<IResponse<any>> {
    // Validate params, build query
    const {
      companyId,
      employeeId,
      startMonth,
      endMonth,
      page,
      limit,
      sortBy,
      sortOrder,
    } = params;
    const { records, total } = await this.payrollRepository.getPayrollRecords({
      companyId,
      employeeId,
      startMonth,
      endMonth,
      page,
      limit,
      sortBy,
      sortOrder,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll report retrieved successfully',
      data: {
        records,
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async getEmployeePayrollReport(
    employeeId: string,
    companyId?: string,
    startMonth?: string,
    endMonth?: string,
  ): Promise<IResponse<any>> {
    try {
      // Optionally validate employee and company exist

      const records = await this.payrollRepository.getEmployeePayrollRecords(
        employeeId,
        companyId,
        startMonth,
        endMonth,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Employee payroll records retrieved successfully',
        data: {
          employeeId,
          companyId,
          startMonth,
          endMonth,
          records,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get employee payroll report: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve employee payroll report due to an unexpected error',
      );
    }
  }

  async getPayrollByMonth(
    companyId: string,
    payrollMonth: string, // Format: YYYY-MM
  ): Promise<IResponse<any>> {
    try {
      // Validate company exists
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      const payrollRecords =
        await this.payrollRepository.getCompanyPayrollByMonth(
          companyId,
          payrollMonth,
        );

      // Calculate summary statistics
      const summary = {
        totalEmployees: payrollRecords.length,
        totalGrossSalary: 0,
        totalDeductions: 0,
        totalNetSalary: 0,
      };

      payrollRecords.forEach((record) => {
        const salaryData = record.salaryData as any;
        summary.totalGrossSalary += salaryData.grossSalary || 0;
        summary.totalDeductions += salaryData.totalDeductions || 0;
        summary.totalNetSalary += salaryData.netSalary || 0;
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Payroll records retrieved successfully',
        data: {
          companyName: company.name,
          payrollMonth,
          summary,
          records: payrollRecords,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to get payroll by month: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve payroll records due to an unexpected error',
      );
    }
  }

  async getPayrollStats(
    companyId: string,
    startMonth?: string,
    endMonth?: string,
  ): Promise<IResponse<any>> {
    try {
      // Validate company exists
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (startMonth) {
        const [year, month] = startMonth.split('-');
        startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      }

      if (endMonth) {
        const [year, month] = endMonth.split('-');
        endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
      }

      const stats = await this.payrollRepository.getPayrollStats(
        companyId,
        startDate,
        endDate,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Payroll statistics retrieved successfully',
        data: {
          companyName: company.name,
          period: {
            startMonth,
            endMonth,
          },
          statistics: stats,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to get payroll stats: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve payroll statistics due to an unexpected error',
      );
    }
  }

  private validateAdminInputsForCustomFields(
    employees: Employee[],
    customFields: any[],
    adminInputs: Record<string, Record<string, number>> = {},
  ) {
    const requiredFields = customFields.filter(
      (f) => f.requiresAdminInput && f.enabled,
    );
    const missing: string[] = [];

    employees.forEach((emp) => {
      const empInputs = adminInputs?.[emp.id] || {};
      requiredFields.forEach((field) => {
        if (
          empInputs[field.key] === undefined ||
          empInputs[field.key] === null
        ) {
          missing.push(
            `Employee ${emp.id} (${emp.firstName} ${emp.lastName}): ${field.label}`,
          );
        }
      });
    });

    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing admin input for required custom fields:\n${missing.join(
          '\n',
        )}`,
      );
    }
  }

  private async processPayrollCalculation(
    companyId: string,
    employees: Employee[],
    salaryTemplate: SalaryTemplate,
    payrollMonth: string,
    basicDuty: number,
    adminInputs: Record<string, Record<string, number>> = {},
  ): Promise<any[]> {
    // Parse the salary template configuration
    const templateConfig = this.parseSalaryTemplateConfig(salaryTemplate);

    // Get attendance data for the month
    const attendanceData = await this.payrollRepository.getAttendanceByMonth(
      employees.map((e) => e.id),
      companyId,
      payrollMonth,
    );

    // Calculate payroll for each employee
    return Promise.all(
      employees.map(async (employee, idx) => {
        try {
          // Get employee's employment details for this company
          const employmentHistory =
            await this.employeeRepository.getEmploymentHistory(employee.id);

          if (!employmentHistory || !employmentHistory.length) {
            return {
              employeeId: employee.id,
              employeeName: `${employee.firstName} ${employee.lastName}`,
              error: 'No employment history found',
            };
          }

          // Find current employment for this company
          const currentEmployment = employmentHistory.find(
            (history) =>
              history.companyId === salaryTemplate.companyId &&
              !history.leavingDate,
          );

          if (!currentEmployment) {
            return {
              employeeId: employee.id,
              employeeName: `${employee.firstName} ${employee.lastName}`,
              error: 'Employee is not currently employed by this company',
            };
          }

          // Get employee's attendance
          const attendance = attendanceData.find(
            (a) => a.employeeId === employee.id,
          );
          const presentDays = attendance ? attendance.presentCount : 0;

          // Get admin input for this employee
          const adminInput = adminInputs?.[employee.id] || {};

          // Calculate salary based on template, attendance, and admin input
          const salaryCalculation = this.calculateEmployeeSalary(
            employee,
            currentEmployment,
            templateConfig,
            basicDuty,
            presentDays,
            adminInput,
          );

          // Set serial number (1-based index)
          salaryCalculation.serialNumber = idx + 1;

          // // Save the calculated salary record
          // await this.payrollRepository.saveSalaryRecord(
          //   employee.id,
          //   salaryTemplate.companyId,
          //   payrollMonth,
          //   salaryCalculation,
          // );

          return {
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            presentDays,
            salary: salaryCalculation,
          };
        } catch (error) {
          this.logger.error(
            `Error calculating salary for employee ${employee.id}: ${error.message}`,
            error.stack,
          );

          return {
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            error: 'Failed to calculate salary',
          };
        }
      }),
    );
  }

  private parseSalaryTemplateConfig(salaryTemplate: SalaryTemplate): any {
    try {
      // Safely parse JSON fields
      const mandatoryFields = Array.isArray(salaryTemplate.mandatoryFields)
        ? salaryTemplate.mandatoryFields
        : JSON.parse(salaryTemplate.mandatoryFields as string);

      const optionalFields = Array.isArray(salaryTemplate.optionalFields)
        ? salaryTemplate.optionalFields
        : JSON.parse(salaryTemplate.optionalFields as string);

      const customFields = Array.isArray(salaryTemplate.customFields)
        ? salaryTemplate.customFields
        : JSON.parse(salaryTemplate.customFields as string);

      // Combine all field types for easier access
      const allFields = [
        ...mandatoryFields,
        ...optionalFields,
        ...customFields,
      ].filter((field) => field.enabled !== false);

      return {
        fields: allFields,
        allowanceFields: allFields.filter(
          (f) => f.purpose === SalaryFieldPurpose.ALLOWANCE,
        ),
        deductionFields: allFields.filter(
          (f) => f.purpose === SalaryFieldPurpose.DEDUCTION,
        ),
        basicFields: allFields.filter(
          (f) => f.purpose === SalaryFieldPurpose.INFORMATION,
        ),
        calculationFields: allFields.filter((f) => f.purpose === 'CALCULATION'),
      };
    } catch (error) {
      this.logger.error(`Error parsing salary template: ${error.message}`);
      throw new BadRequestException('Invalid salary template configuration');
    }
  }

  private calculateEmployeeSalary(
    employee: Employee,
    currentEmployment: EmploymentHistory,
    templateConfig: any,
    basicDuty: number,
    presentDays: number,
    adminInput: Record<string, number> = {},
  ): Record<string, any> {
    // Get monthly salary from employment history
    const monthlySalary = currentEmployment.salary;

    // Calculate wages per day
    const wagesPerDay = monthlySalary / basicDuty;

    // Calculate basic pay based on attendance
    const basicPay = wagesPerDay * presentDays;

    // Initialize salary calculation object
    const salaryCalculation: Record<string, any> = {
      monthlySalary,
      wagesPerDay: Math.round(wagesPerDay * 100) / 100, // Round to 2 decimals
      basicDuty,
      dutyDone: presentDays,
      basicPay: Math.round(basicPay * 100) / 100,
    };

    // Process all fields dynamically based on template
    let totalAllowances = 0;
    let totalDeductions = 0;

    templateConfig.fields.forEach((field) => {
      let fieldValue = 0;

      // Use admin input if required
      if (field.requiresAdminInput && adminInput[field.key] !== undefined) {
        fieldValue = Number(adminInput[field.key]);
      } else if (field.rules && field.rules.defaultValue !== undefined) {
        fieldValue = Number(field.rules.defaultValue);
      } else {
        fieldValue = this.calculateFieldValue(field, {
          basicPay,
          monthlySalary,
          presentDays,
          basicDuty,
          grossSalary: basicPay + totalAllowances,
        });
      }

      if (field.purpose === SalaryFieldPurpose.ALLOWANCE) {
        totalAllowances += fieldValue;
      } else if (field.purpose === SalaryFieldPurpose.DEDUCTION) {
        totalDeductions += fieldValue;
      }
      // INFORMATION and CALCULATION: just store the value

      salaryCalculation[field.key] = Math.round(fieldValue * 100) / 100;
    });

    salaryCalculation.grossSalary =
      Math.round((basicPay + totalAllowances) * 100) / 100;
    salaryCalculation.totalDeductions = Math.round(totalDeductions * 100) / 100;
    salaryCalculation.netSalary =
      Math.round((salaryCalculation.grossSalary - totalDeductions) * 100) / 100;
    salaryCalculation.wagesPerDay = Math.round(wagesPerDay * 100) / 100; // Round to 2 decimals

    // Add extra fields if present
    if (currentEmployment.companyName) {
      salaryCalculation.companyName = currentEmployment.companyName;
    }
    if (employee.firstName || employee.lastName) {
      salaryCalculation.employeeName = `${employee.firstName ?? ''} ${
        employee.lastName ?? ''
      }`.trim();
    }
    if (currentEmployment.designationName) {
      salaryCalculation.designation = currentEmployment.designationName;
    }
    if (currentEmployment.salary) {
      salaryCalculation.monthlyPay = currentEmployment.salary;
    }
    if (employee.fatherName) {
      salaryCalculation.fatherName = employee.fatherName;
    }
    if (employee['uanNumber']) {
      salaryCalculation.uanNumber = employee['uanNumber'];
    }
    if (salaryCalculation.lwf !== undefined) {
      // Already calculated, just keep it
    } else if (employee['lwf']) {
      salaryCalculation.lwf = employee['lwf'];
    }

    return salaryCalculation;
  }

  private calculateFieldValue(
    field: any,
    calculationContext: {
      basicPay: number;
      monthlySalary: number;
      presentDays: number;
      basicDuty: number;
      grossSalary?: number;
    },
  ): number {
    const { basicPay, monthlySalary, grossSalary } = calculationContext;
    const rules = field.rules || {};

    // Handle percentage-based calculations
    if (rules.calculationType === 'percentage') {
      const percentage = rules.percentage || 0;
      switch (rules.basedOn) {
        case 'basicPay':
          return basicPay * (percentage / 100);
        case 'monthlySalary':
          return monthlySalary * (percentage / 100);
        case 'grossSalary':
          return (grossSalary || basicPay) * (percentage / 100);
        default:
          return 0;
      }
    }

    // Handle fixed amount calculations
    if (rules.calculationType === 'fixed') {
      return rules.amount || 0;
    }

    // Handle specific field calculations (legacy support)
    switch (field.key) {
      case 'pf':
        return basicPay * 0.12; // 12% of basic pay
      case 'esic':
        return (grossSalary || basicPay) * 0.0075; // 0.75% of gross salary
      case 'lwf':
        return 10; // Fixed amount
      default:
        return rules.defaultValue || 0;
    }
  }

  private getBasicDutyFromTemplate(templateConfig: any): number {
    const basicDutyField = templateConfig.calculationFields?.find(
      (field) => field.key === 'basicDuty',
    );

    if (!basicDutyField) {
      this.logger.warn(
        'Basic duty field not found in salary template, using default value of 30',
      );
      return 30;
    }

    return basicDutyField.rules?.defaultValue || 30;
  }
}
