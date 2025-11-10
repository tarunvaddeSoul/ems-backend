import {
  Injectable,
  Logger,
  NotFoundException,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  Employee,
  SalaryTemplate,
  EmploymentHistory,
  SalaryCategory,
  EmployeeSalaryHistory,
} from '@prisma/client';
import { CompanyRepository } from 'src/company/company.repository';
import { SalaryFieldPurpose } from 'src/company/enum/company.enum';
import { EmployeeRepository } from 'src/employee/employee.repository';
import { IResponse } from 'src/types/response.interface';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
import { PayrollRepository } from './payroll.repository';
import { endOfMonth } from 'date-fns';
import { FinalizePayrollDto } from './dto/finalize-payroll.dto';
import { SalaryRateScheduleService } from 'src/salary-rate-schedule/salary-rate-schedule.service';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    private readonly payrollRepository: PayrollRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly salaryRateScheduleService: SalaryRateScheduleService,
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

    // Batch get attendance data for all employees in one query
    const attendanceData = await this.payrollRepository.getAttendanceByMonth(
      employees.map((e) => e.id),
      companyId,
      payrollMonth,
    );

    // Batch get all employment histories in a single query instead of N+1
    const employeeIds = employees.map((e) => e.id);
    const allEmploymentHistories = await this.employeeRepository.getActiveEmploymentHistories(
      employeeIds,
      companyId,
    );

    // Batch get employee salary history for the payroll month
    const salaryHistoryMap =
      await this.payrollRepository.getEmployeeSalaryHistoryForMonthBatch(
        employeeIds,
        payrollMonth,
      );

    // Create a map for O(1) lookup
    const employmentMap = new Map(
      allEmploymentHistories.map((eh) => [eh.employeeId, eh]),
    );

    // Calculate payroll for each employee
    return employees.map((employee, idx) => {
      try {
        // Get employee's employment details for this company
        const currentEmployment = employmentMap.get(employee.id);

        if (!currentEmployment || currentEmployment.companyId !== companyId) {
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

        // Get salary history for this month (if exists, otherwise use current employee salary)
        const salaryHistory = salaryHistoryMap.get(employee.id);

        // Calculate salary based on template, attendance, and admin input
        const salaryCalculation = this.calculateEmployeeSalary(
          employee,
          currentEmployment,
          templateConfig,
          basicDuty,
          presentDays,
          adminInput,
          payrollMonth,
          salaryHistory,
        );

        // Set serial number (1-based index)
        (salaryCalculation as any).serialNumber = idx + 1;

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
    });
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

  private async calculateEmployeeSalary(
    employee: Employee,
    currentEmployment: EmploymentHistory,
    templateConfig: any,
    basicDuty: number,
    presentDays: number,
    adminInput: Record<string, number> = {},
    payrollMonth: string,
    salaryHistory?: EmployeeSalaryHistory | null,
  ): Promise<Record<string, any>> {
    // Validate payroll month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(payrollMonth)) {
      throw new BadRequestException(
        `Invalid payroll month format. Expected YYYY-MM, got: ${payrollMonth}`,
      );
    }

    // Validate presentDays
    if (presentDays < 0) {
      throw new BadRequestException(
        `Present days cannot be negative for employee ${employee.id}`,
      );
    }

    // Determine salary source: use historical salary if available, otherwise use current employee salary
    let salaryCategory: SalaryCategory | null = null;
    let salarySubCategory: any = null;
    let salaryPerDay: number | null = null;
    let monthlySalary: number | null = null;

    if (salaryHistory) {
      // Use historical salary for this month
      salaryCategory = salaryHistory.salaryCategory;
      salarySubCategory = salaryHistory.salarySubCategory;
      salaryPerDay = salaryHistory.ratePerDay ?? null;
      monthlySalary = salaryHistory.monthlySalary ?? null;
    } else if (employee.salaryCategory) {
      // Use current employee salary
      salaryCategory = employee.salaryCategory;
      salarySubCategory = employee.salarySubCategory;
      salaryPerDay = employee.salaryPerDay ?? null;
      monthlySalary = employee.monthlySalary ?? null;
    } else {
      // Fallback to employment history salary (legacy)
      // Use salaryPerDay if available (for CENTRAL/STATE employees)
      if (currentEmployment.salaryPerDay) {
        salaryPerDay = currentEmployment.salaryPerDay;
        // Determine category from salaryType if available
        if (currentEmployment.salaryType === 'PER_DAY') {
          // Try to infer category from employee's current employment
          // For legacy employees, we'll use the salary as monthly equivalent
          monthlySalary = currentEmployment.salary;
        }
      } else {
        // For SPECIALIZED or legacy employees without salaryPerDay
        monthlySalary = currentEmployment.salary;
      }
    }

    // Calculate gross salary based on category
    let grossSalary = 0;
    let wagesPerDay = 0;
    let basicPay = 0;

    // Handle CENTRAL/STATE category (explicit or inferred from salaryPerDay + salaryType)
    const isCentralStateCategory =
      salaryCategory === SalaryCategory.CENTRAL ||
      salaryCategory === SalaryCategory.STATE ||
      (salaryPerDay && salaryPerDay > 0 && currentEmployment.salaryType === 'PER_DAY');

    if (isCentralStateCategory) {
      // For Central/State: per-day rate * present days
      if (salaryPerDay && salaryPerDay > 0) {
        wagesPerDay = salaryPerDay;
        grossSalary = salaryPerDay * presentDays;
        basicPay = grossSalary; // For per-day, basic pay = gross salary
      } else {
        // Try to lookup from rate schedule if salaryPerDay is missing
        if (salarySubCategory) {
          const [year, monthNum] = payrollMonth.split('-').map(Number);
          const monthDate = new Date(year, monthNum - 1, 15); // Use mid-month date for lookup
          try {
            const activeRate = await this.salaryRateScheduleService.getActiveRate(
              salaryCategory,
              salarySubCategory,
              monthDate,
            );
            if (activeRate) {
              wagesPerDay = activeRate.ratePerDay;
              grossSalary = activeRate.ratePerDay * presentDays;
              basicPay = grossSalary;
            } else {
              throw new BadRequestException(
                `Employee ${employee.id} (${salaryCategory} ${salarySubCategory}) missing salaryPerDay and no active rate schedule found for ${payrollMonth}`,
              );
            }
          } catch (error) {
            if (error instanceof BadRequestException) {
              throw error;
            }
            throw new BadRequestException(
              `Employee ${employee.id} (${salaryCategory} ${salarySubCategory}) missing salaryPerDay and failed to lookup rate schedule: ${error.message}`,
            );
          }
        } else {
          throw new BadRequestException(
            `Employee ${employee.id} (${salaryCategory}) missing salaryPerDay and salarySubCategory`,
          );
        }
      }
    } else if (salaryCategory === SalaryCategory.SPECIALIZED) {
      // For Specialized: (monthlySalary / totalDaysInMonth) * presentDays
      if (monthlySalary && monthlySalary > 0) {
        // Parse month to get total days
        const [year, monthNum] = payrollMonth.split('-').map(Number);
        const totalDaysInMonth = new Date(year, monthNum, 0).getDate();
        if (totalDaysInMonth === 0) {
          throw new BadRequestException(
            `Invalid month in payroll month: ${payrollMonth}`,
          );
        }
        wagesPerDay = monthlySalary / totalDaysInMonth;
        grossSalary = (monthlySalary / totalDaysInMonth) * presentDays;
        basicPay = grossSalary; // For specialized, basic pay = gross salary
      } else {
        throw new BadRequestException(
          `Employee ${employee.id} (SPECIALIZED) missing or invalid monthlySalary`,
        );
      }
    } else {
      // Legacy fallback: use employment history salary
      if (monthlySalary) {
        wagesPerDay = monthlySalary / basicDuty;
        basicPay = wagesPerDay * presentDays;
        grossSalary = basicPay;
      } else {
        throw new BadRequestException(
          `Employee ${employee.id} missing salary information`,
        );
      }
    }

    // Initialize salary calculation object
    const salaryCalculation: Record<string, any> = {
      monthlySalary: salaryCategory === SalaryCategory.SPECIALIZED ? monthlySalary : null,
      salaryPerDay: salaryCategory !== SalaryCategory.SPECIALIZED ? salaryPerDay : null,
      wagesPerDay: Math.round(wagesPerDay * 100) / 100, // Round to 2 decimals
      basicDuty,
      dutyDone: presentDays,
      basicPay: Math.round(basicPay * 100) / 100,
      grossSalary: Math.round(grossSalary * 100) / 100, // Initial gross salary (before allowances)
    };

    // Process all fields dynamically based on template
    let totalAllowances = 0;
    let totalDeductions = 0;

    templateConfig.fields.forEach((field) => {
      let fieldValue = 0;

      // Skip PF and ESIC - they will be calculated separately after gross salary is finalized
      if (field.key === 'pf' || field.key === 'esic') {
        salaryCalculation[field.key] = 0; // Placeholder, will be recalculated
        return;
      }

      // Use admin input if required
      if (field.requiresAdminInput && adminInput[field.key] !== undefined) {
        fieldValue = Number(adminInput[field.key]);
      } else if (field.rules && field.rules.defaultValue !== undefined) {
        fieldValue = Number(field.rules.defaultValue);
      } else {
        fieldValue = this.calculateFieldValue(field, {
          basicPay,
          monthlySalary: monthlySalary || 0,
          presentDays,
          basicDuty,
          grossSalary: grossSalary + totalAllowances,
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

    // Calculate final gross salary with allowances
    const finalGrossSalary = grossSalary + totalAllowances;
    salaryCalculation.grossSalary =
      Math.round(finalGrossSalary * 100) / 100;

    // Calculate PF and ESIC after gross salary is finalized (with allowances)
    // PF and ESIC are calculated only if grossSalary <= 15000
    let pfAmount = 0;
    let esicAmount = 0;

    // Calculate PF if enabled
    if (employee.pfEnabled) {
      if (finalGrossSalary <= 15000) {
        pfAmount = Math.min(finalGrossSalary * 0.12, 1800); // 12% capped at 1800
      }
      salaryCalculation.pf = Math.round(pfAmount * 100) / 100;
      totalDeductions += pfAmount;
    } else {
      salaryCalculation.pf = 0;
    }

    // Calculate ESIC if enabled
    if (employee.esicEnabled) {
      if (finalGrossSalary <= 15000) {
        esicAmount = Math.min(finalGrossSalary * 0.0075, 113); // 0.75% capped at 113
      }
      salaryCalculation.esic = Math.round(esicAmount * 100) / 100;
      totalDeductions += esicAmount;
    } else {
      salaryCalculation.esic = 0;
    }
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

    // Handle specific field calculations
    // Note: PF and ESIC are now calculated based on employee flags and gross salary caps
    // This is handled in calculateEmployeeSalary method, not here
    switch (field.key) {
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
