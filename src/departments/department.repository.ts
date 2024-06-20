import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentRepository {
  constructor(private prisma: PrismaService) {}

  async addUserDepartment(name: string) {
    return this.prisma.userDepartment.create({ data: { name } });
  }

  async getUserDepartmentByName(name: string) {
    return this.prisma.userDepartment.findFirst({ where: { name } });
  }

  async getUserDepartmentById(id: string) {
    return this.prisma.userDepartment.findFirst({ where: { id } });
  }

  async getAllUserDepartments() {
    return this.prisma.userDepartment.findMany();
  }

  async deleteUserDepartmentByName(name: string) {
    return this.prisma.userDepartment.delete({ where: { name } });
  }

  async addEmployeeDepartment(name: string) {
    return this.prisma.employeeDepartment.create({ data: { name } });
  }

  async getEmployeeDepartmentByName(name: string) {
    return this.prisma.employeeDepartment.findFirst({ where: { name } });
  }

  async getEmployeeDepartmentById(id: string) {
    return this.prisma.employeeDepartment.findFirst({ where: { id } });
  }

  async getAllEmployeeDepartments() {
    return this.prisma.employeeDepartment.findMany();
  }

  async deleteEmployeeDepartmentByName(name: string) {
    return this.prisma.employeeDepartment.delete({ where: { name } });
  }
}
