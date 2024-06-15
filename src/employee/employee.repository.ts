import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee } from '@prisma/client';
import { IEmployee } from './interface/employee.interface';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(data: IEmployee): Promise<Employee> {
    try {
      const employeeResponse = await this.prisma.employee.create({
        data: {
          name: data.name,
          photo: data.photo,
          address: data.address,
          aadhaar: data.aadhaar,
          companyId: data.companyId,
          bankName: data.bankName,
          bankAccountName: data.bankAccountName,
          bankAccountNumber: data.bankAccountNumber,
          ifsc: data.ifsc,
          salary: data.salary,
        },
      });
      return employeeResponse;
    } catch (error) {
      new Logger().debug(error.message);
      throw error;
    }
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    try {
      const employeeResponse = await this.prisma.employee.update({
        where: { id },
        data,
      });
      return employeeResponse;
    } catch (error) {
      return error;
    }
  }

  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const employeeResponse = await this.prisma.employee.findUnique({
        where: { id },
      });
      return employeeResponse;
    } catch (error) {
      return error;
    }
  }

  async findMany(ids: string[]): Promise<Employee[]> {
    try {
      const employees = await this.prisma.employee.findMany({
        where: { id: { in: ids } },
      });
      return employees;
    } catch (error) {
      return error;
    }
  }

  async getAllEmployees(): Promise<Employee[]> {
    try {
      const employeesResponse = await this.prisma.employee.findMany();
      return employeesResponse;
    } catch (error) {
      return error;
    }
  }

  async deleteEmployeeById(id: string) {
    try {
      const deleteEmployeeResponse = await this.prisma.employee.delete({
        where: { id },
      });
      return deleteEmployeeResponse;
    } catch (error) {
      return error;
    }
  }
}
