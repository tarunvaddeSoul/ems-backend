import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CalculateSalaryDto } from './dto/calculate-salary.dto';
import { CompanyRepository } from 'src/company/company.repository';
import { EmployeeRepository } from 'src/employee/employee.repository';
import { SalaryRepository } from './salary.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalaryService {
  constructor(
    private readonly salaryRepository: SalaryRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async calculateSalary(data: CalculateSalaryDto) {
    try {
      const company = await this.companyRepository.findById(data.companyId);
      if (!company) {
        throw new NotFoundException(
          `Company with ID: ${data.companyId} not found.`,
        );
      }

      const employee = await this.employeeRepository.getEmployeeById(
        data.employeeId,
      );

      if (!employee) {
        throw new NotFoundException(
          `Employee with ID: ${data.employeeId} not found.`,
        );
      }

      const currentEmployment = employee.employmentHistories.find(
        (history) =>
          history.companyId === data.companyId && !history.leavingDate,
      );

      if (!currentEmployment) {
        throw new BadRequestException(
          'Employee is not currently employed by this company',
        );
      }

      const salaryTemplate = company.salaryTemplates[0] as any;
      const monthlySalary = currentEmployment.salary;

      // Perform calculations
      const basicDuty = parseInt(salaryTemplate.fields.basicDuty.value);
      const wagesPerDay = parseFloat((monthlySalary / basicDuty).toFixed(2));
      const basicPay = parseFloat((wagesPerDay * data.dutyDone).toFixed(2));
      const epfWages = monthlySalary;

      let bonus = 0;
      if (salaryTemplate.fields?.bonus?.enabled) {
        bonus = parseFloat((monthlySalary * 0.0833).toFixed(2)); // 8.33%
      }

      const grossSalary = basicPay + bonus;

      let pf = 0;
      if (salaryTemplate.fields?.pf?.enabled) {
        pf = parseFloat((basicPay * 0.12).toFixed(2)); // 12%
      }

      let esic = 0;
      if (salaryTemplate.fields?.esic?.enabled) {
        esic = parseFloat((grossSalary * 0.0075).toFixed(2)); // 0.75%
      }

      const lwf = salaryTemplate?.fields?.lwf?.enabled ? 10 : 0;

      const totalDeductions =
        pf +
        esic +
        (data.advance || 0) +
        (data.uniform || 0) +
        (data.penalty || 0) +
        lwf +
        (data.otherDeductions || 0);

      const netSalary = grossSalary - totalDeductions + (data.allowance || 0);

      const salaryData: Prisma.SalaryCreateInput = {
        employee: { connect: { id: data.employeeId } },
        company: { connect: { id: data.companyId } },
        month: data.month,
        monthlySalary: monthlySalary,
        dutyDone: data.dutyDone,
        wagesPerDay,
        basicPay: basicPay,
        epfWages: epfWages,
        bonus: bonus,
        grossSalary: grossSalary,
        pf: pf,
        esic: esic,
        advance: data.advance || 0,
        uniform: data.uniform || 0,
        penalty: data.penalty || 0,
        lwf: lwf,
        otherDeductions: data.otherDeductions || 0,
        otherDeductionsRemark: data.otherDeductionsRemark,
        allowance: data.allowance || 0,
        allowanceRemark: data.allowanceRemark,
        totalDeductions: totalDeductions,
        netSalary: netSalary,
      };
      console.log(JSON.stringify(salaryData, null, 2));
      const salary = await this.salaryRepository.createOrUpdateSalary(
        salaryData,
      );
      return {
        message: 'Salary calculated successfully!',
        data: salary,
      };
    } catch (error) {
      throw error;
    }
  }

  async getSalariesByCompanyAndMonth(companyId: string, month: string) {
    try {
      const salaryResponse =
        await this.salaryRepository.getSalariesByCompanyAndMonth(
          companyId,
          month,
        );
      return {
        message: 'Salaries fetched successfully!',
        data: salaryResponse,
      };
    } catch (error) {
      throw error;
    }
  }
}
