import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentRepository } from './department.repository';

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async addUserDepartment(name: string) {
    try {
      const department =
        await this.departmentRepository.getUserDepartmentByName(name);
      if (department) {
        throw new ConflictException(
          `Department with name: ${name} already exists.`,
        );
      }
      const addUserDepartmentResponse =
        await this.departmentRepository.addUserDepartment(name);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User department added successfully!',
        data: addUserDepartmentResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllUserDepartments() {
    try {
      const departments =
        await this.departmentRepository.getAllUserDepartments();
      if (departments.length === 0) {
        throw new NotFoundException(`No user departments found.`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Departments fetched successfully!',
        data: departments,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteUserDepartmentByName(name: string) {
    try {
      const department =
        await this.departmentRepository.getUserDepartmentByName(name);
      if (!department) {
        throw new NotFoundException(
          `Department with name: ${name} does not exist.`,
        );
      }
      const deleteResponse =
        await this.departmentRepository.deleteUserDepartmentByName(name);
      return {
        statusCode: HttpStatus.OK,
        message: 'Department deleted successfully.',
        data: deleteResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async addEmployeeDepartment(name: string) {
    try {
      const department =
        await this.departmentRepository.getEmployeeDepartmentByName(name);
      if (department) {
        throw new ConflictException(
          `Department with name: ${name} already exists.`,
        );
      }
      const addEmployeeDepartmentResponse =
        await this.departmentRepository.addEmployeeDepartment(name);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Employee department added successfully!',
        data: addEmployeeDepartmentResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllEmployeeDepartments() {
    try {
      const departments =
        await this.departmentRepository.getAllEmployeeDepartments();
      if (departments.length === 0) {
        throw new NotFoundException(`No employee departments found.`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Departments fetched successfully!',
        data: departments,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteEmployeeDepartmentByName(name: string) {
    try {
      const department =
        await this.departmentRepository.getEmployeeDepartmentByName(name);
      if (!department) {
        throw new NotFoundException(
          `Department with name: ${name} does not exist.`,
        );
      }
      const deleteResponse =
        await this.departmentRepository.deleteEmployeeDepartmentByName(name);
      return {
        statusCode: HttpStatus.OK,
        message: 'Department deleted successfully.',
        data: deleteResponse,
      };
    } catch (error) {
      throw error;
    }
  }
}
