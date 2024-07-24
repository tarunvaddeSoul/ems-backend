// src/salary/salary.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateSalaryDto } from './dto/calculate-salary.dto';
import { CompanyRepository } from 'src/company/company.repository';
import { EmployeeRepository } from 'src/employee/employee.repository';
import { SalaryRepository } from './salary.repository';

@Injectable()
export class SalaryService {
  constructor(private readonly salaryRepository: SalaryRepository, private readonly companyRepository: CompanyRepository, private readonly employeeRepository: EmployeeRepository) {}

  async calculateSalary(data: CalculateSalaryDto) {

    const company = await this.companyRepository.findById(data.companyId);
    if (!company) {
      throw new NotFoundException(`Company with ID: ${data.companyId} not found.`);
    }

    const employee = await this.employeeRepository.getEmployeeById(data.employeeId);

    if (!employee) {
      throw new NotFoundException(`Employee with ID: ${data.employeeId} not found.`);
    }

    const currentEmployment = employee.employmentHistories.find(
      (history) => history.companyId === data.companyId && !history.leavingDate
    );


    if (!currentEmployment) {
      throw new Error('Employee is not currently employed by this company');
    }

    const salaryTemplate = company.salaryTemplates[0] as any;
    const monthlySalary = currentEmployment.salary;

    // Perform calculations
    const basicDuty = parseInt(salaryTemplate.fields.basicDuty.value);
    const wagesPerDay = parseFloat((monthlySalary / basicDuty).toFixed(2));
    const basicPay = parseFloat((wagesPerDay * data.dutyDone).toFixed(2));
    const epfWages = monthlySalary;

    let bonus = 0;
    if (salaryTemplate.fields.bonus.enabled) {
      bonus = parseFloat((monthlySalary * 0.0833).toFixed(2)); // 8.33%
    }

    const grossSalary = basicPay + bonus;

    let pf = 0;
    if (salaryTemplate.fields.pf.enabled) {
      pf = parseFloat((basicPay * 0.12).toFixed(2)); // 12%
    }

    let esic = 0;
    if (salaryTemplate.fields.esic.enabled) {
      esic = parseFloat((grossSalary * 0.0075).toFixed(2)); // 0.75%
    }

    const lwf = salaryTemplate.fields.lwf.enabled ? 10 : 0;

    const totalDeductions =
      pf +
      esic +
      (data.advance || 0) +
      (data.uniform || 0) +
      (data.penalty || 0) +
      lwf +
      (data.otherDeductions || 0);

    const netSalary = grossSalary - totalDeductions + (data.allowance || 0);

    // Save the calculated salary
    const salary = await this.salaryRepository.createOrUpdateSalary({
        employeeId: data.employeeId,
        companyId: data.companyId,
        month: data.month,
        monthlySalary,
        dutyDone: data.dutyDone,
        wagesPerDay,
        basicPay,
        epfWages,
        bonus,
        grossSalary,
        pf,
        esic,
        advance: data.advance || 0,
        uniform: data.uniform || 0,
        penalty: data.penalty || 0,
        lwf,
        otherDeductions: data.otherDeductions || 0,
        otherDeductionsRemark: data.otherDeductionsRemark,
        allowance: data.allowance || 0,
        allowanceRemark: data.allowanceRemark,
        totalDeductions,
        netSalary,
    });

    return salary;
  }

  async getSalariesByCompanyAndMonth(companyId: string, month: string) {
    try {
      const salaryResponse = await this.salaryRepository.getSalariesByCompanyAndMonth(companyId, month);
      return salaryResponse;
    } catch (error) {
      throw error;
    }
  }
}