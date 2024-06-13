import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee } from '@prisma/client';
import { IEmployee } from './interface/employee.interface';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(data: IEmployee): Promise<Employee> {
    return this.prisma.employee.create({ data });
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  async getEmployeeById(id: string): Promise<Employee> {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  async getAllEmployees(): Promise<Employee[]> {
    return this.prisma.employee.findMany();
  }
}
