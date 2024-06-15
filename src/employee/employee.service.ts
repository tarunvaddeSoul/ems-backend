import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EmployeeRepository } from './employee.repository';
import { AwsS3Service } from '../aws/aws-s3.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from '@prisma/client';
import { IEmployee } from './interface/employee.interface';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly logger: Logger,
  ) {}

  async createEmployee(
    data: CreateEmployeeDto,
    photo: Express.Multer.File,
    aadhaar: Express.Multer.File,
  ): Promise<Employee | any> {
    try {
      const folder = `employees/${data.name}`;
      const photoUrl = await this.awsS3Service.uploadFile(
        photo,
        `${folder}/photo`,
      );
      const aadhaarUrl = await this.awsS3Service.uploadFile(
        aadhaar,
        `${folder}/aadhaar`,
      );

      const employeeData: IEmployee = {
        name: data.name,
        photo: photoUrl ? photoUrl : '',
        address: data.address,
        aadhaar: aadhaarUrl ? aadhaarUrl : '',
        companyId: data.companyId,
        bankName: data.bankName,
        bankAccountName: data.bankAccountName,
        bankAccountNumber: data.bankAccountNumber,
        ifsc: data.ifsc,
        salary: data.salary,
      };

      const employee = await this.employeeRepository.createEmployee(
        employeeData,
      );
      return {
        message: 'Employee created successfully',
        data: employee,
      };

      return this.employeeRepository.createEmployee(employeeData);
    } catch (error) {
      this.logger.error(
        `Error in creating employee with error ${error.message}`,
      );
      throw error;
    }
  }

  async updateEmployee(
    id: string,
    data: UpdateEmployeeDto,
    photo?: Express.Multer.File,
    aadhaar?: Express.Multer.File,
  ): Promise<Employee | any> {
    try {
      const existingEmployee = await this.employeeRepository.getEmployeeById(
        id,
      );
      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }

      const name = data.name || existingEmployee.name;
      const folder = `employees/${name}`;

      const updateFile = async (
        file: Express.Multer.File,
        existingFileUrl: string,
        fileType: string,
      ) => {
        if (file) {
          const key = this.extractKeyFromUrl(existingFileUrl);
          if (key) {
            await this.awsS3Service.deleteFile(key);
          }
          return await this.awsS3Service.uploadFile(
            file,
            `${folder}/${fileType}`,
          );
        }
        return existingFileUrl;
      };

      existingEmployee.photo = await updateFile(
        photo,
        existingEmployee.photo,
        'photo',
      );
      existingEmployee.aadhaar = await updateFile(
        aadhaar,
        existingEmployee.aadhaar,
        'aadhaar',
      );

      const fieldsToUpdate = [
        'name',
        'bankAccountName',
        'bankAccountNumber',
        'bankName',
        'ifsc',
        'salary',
      ];

      fieldsToUpdate.forEach((field) => {
        existingEmployee[field] = data[field] || existingEmployee[field];
      });

      const employee = this.employeeRepository.updateEmployee(
        id,
        existingEmployee,
      );
      return {
        message: 'Employee updated successfully',
        data: employee,
      };
    } catch (error) {
      this.logger.error(
        `Error in updating employee with ID: ${id} with error ${error.message}`,
      );
      throw error;
    }
  }

  private extractKeyFromUrl(url: string): string {
    if (!url) {
      return null;
    }
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/');
  }

  async getEmployeeById(id: string): Promise<Employee | any> {
    try {
      const employeeResponse = await this.employeeRepository.getEmployeeById(
        id,
      );
      if (!employeeResponse) {
        throw new NotFoundException(`Employee with ID: ${id} not found.`);
      }
      return {
        message: 'Employee retrieved successfully',
        data: employeeResponse,
      };
    } catch (error) {
      this.logger.error(
        `Error in fetching employee by ID: ${id} with error ${error.message}`,
      );
      throw error;
    }
  }

  async deleteEmployeeById(id: string) {
    try {
      const employeeResponse = await this.employeeRepository.getEmployeeById(
        id,
      );
      if (!employeeResponse) {
        throw new NotFoundException(`Employee with ID: ${id} not found.`);
      }
      const photoKey = this.extractKeyFromUrl(employeeResponse.photo);
      const aadhaarKey = this.extractKeyFromUrl(employeeResponse.aadhaar);
      if (photoKey) {
        await this.awsS3Service.deleteFile(photoKey);
      }
      if (aadhaarKey) {
        await this.awsS3Service.deleteFile(aadhaarKey);
      }
      const deleteEmployeeResponse =
        await this.employeeRepository.deleteEmployeeById(id);
      return {
        message: 'Employee deleted successfully',
        data: deleteEmployeeResponse,
      };
    } catch (error) {
      this.logger.error(
        `Error in deleting employee by ID: ${id} with error ${error.message}`,
      );
      throw error;
    }
  }

  async deleteMultipleEmployees(ids: string[]): Promise<{ message: string }> {
    try {
      for (const id of ids) {
        const employee = await this.employeeRepository.getEmployeeById(id);
        if (!employee) {
          throw new NotFoundException(`Employee with ID ${id} not found`);
        }
        const photoKey = this.extractKeyFromUrl(employee.photo);
        const aadhaarKey = this.extractKeyFromUrl(employee.aadhaar);
        if (photoKey) {
          await this.awsS3Service.deleteFile(photoKey);
        }
        if (aadhaarKey) {
          await this.awsS3Service.deleteFile(aadhaarKey);
        }
        await this.employeeRepository.deleteEmployeeById(id);
      }
      return { message: 'Employees deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting employees`);
      throw error;
    }
  }

  async getAllEmployees(): Promise<Employee[] | any> {
    try {
      const employees = await this.employeeRepository.getAllEmployees();
      return {
        message: 'Employee created successfully',
        data: employees,
      };
    } catch (error) {
      this.logger.error(
        `Error in fetching all employees with error ${error.message}`,
      );
      throw error;
    }
  }
}
