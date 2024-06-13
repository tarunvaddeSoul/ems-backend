import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeRepository } from './employee.repository';
import { AwsS3Service } from '../aws/aws-s3.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async createEmployee(
    data: CreateEmployeeDto,
    photo: Express.Multer.File,
    aadhaar: Express.Multer.File,
  ): Promise<any> {
    const folder = `employees/${data.name}`;
    const photoUrl = await this.awsS3Service.uploadFile(
      photo,
      `${folder}/photo`,
    );
    const aadhaarUrl = await this.awsS3Service.uploadFile(
      aadhaar,
      `${folder}/aadhaar`,
    );

    const employeeData = {
      ...data,
      photo: photoUrl,
      aadhaar: aadhaarUrl,
    };

    return this.employeeRepository.createEmployee(employeeData);
  }

  async updateEmployee(
    id: string,
    data: UpdateEmployeeDto,
    photo?: Express.Multer.File,
    aadhaar?: Express.Multer.File,
  ): Promise<any> {
    console.log('inside service', photo, aadhaar);

    const existingEmployee = await this.employeeRepository.getEmployeeById(id);
    if (!existingEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const folder = `employees/${existingEmployee.name}`;

    if (photo) {
      const key = this.extractKeyFromUrl(existingEmployee.photo);
      if (key) {
        await this.awsS3Service.deleteFile(key);
      }

      const photoUrl = await this.awsS3Service.uploadFile(
        photo,
        `${folder}/photo`,
      );
      existingEmployee.photo = photoUrl;
    }

    if (aadhaar) {
      const key = this.extractKeyFromUrl(existingEmployee.aadhaar);
      if (key) {
        await this.awsS3Service.deleteFile(key);
      }
      const aadhaarUrl = await this.awsS3Service.uploadFile(
        aadhaar,
        `${folder}/aadhaar`,
      );
      existingEmployee.aadhaar = aadhaarUrl;
    }

    return this.employeeRepository.updateEmployee(id, existingEmployee);
  }

  private extractKeyFromUrl(url: string): string {
    if (!url) {
      return null;
    }
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/');
  }

  async getEmployeeById(id: string): Promise<any> {
    return this.employeeRepository.getEmployeeById(id);
  }

  async getAllEmployees(): Promise<any> {
    return this.employeeRepository.getAllEmployees();
  }
}
