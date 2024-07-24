import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeRepository } from './employee.repository';
import { AwsS3Service } from '../aws/aws-s3.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from '@prisma/client';
import { IEmployee } from './interface/employee.interface';
import { CompanyRepository } from 'src/company/company.repository';
import { DesignationRepository } from 'src/designations/designation.repository';
import { DepartmentRepository } from 'src/departments/department.repository';
import { GetAllEmployeesDto } from './dto/get-all-employees.dto';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly logger: Logger,
    private readonly companyRepository: CompanyRepository,
    private readonly designationRepository: DesignationRepository,
    private readonly departmentRepository: DepartmentRepository,
  ) {}

  async createEmployee(
    data: CreateEmployeeDto,
    photo: Express.Multer.File | null,
    aadhaar: Express.Multer.File | null,
    panCard: Express.Multer.File | null,
    bankPassbook: Express.Multer.File | null,
    markSheet: Express.Multer.File | null,
    otherDocument: Express.Multer.File | null,
  ): Promise<Employee | any> {
    try {
      // Calculate age from dateOfBirth
      const age = this.calculateAge(data.dateOfBirth);

      // Validate age
      // if (age < 18) {
      //   throw new BadRequestException(
      //     'Employee must be at least 18 years old.',
      //   );
      // }
      const employeeId = this.generateEmployeeId();
      const company = await this.companyRepository.findById(
        data.currentCompanyId,
      );
      if (!company) {
        throw new NotFoundException(
          `Company with ID ${data.currentCompanyId} not found.`,
        );
      }
      let designation;
      if (data.currentCompanyDesignationId) {
        designation = await this.designationRepository.getById(
          data.currentCompanyDesignationId,
        );
        if (!designation) {
          throw new NotFoundException(
            `Designation with ID: ${data.currentCompanyDesignationId} not found.`,
          );
        }
      }

      let employeeDepartment;
      if (data.currentCompanyDepartmentId) {
        employeeDepartment =
          await this.departmentRepository.getEmployeeDepartmentById(
            data.currentCompanyDepartmentId,
          );
        if (!employeeDepartment) {
          throw new NotFoundException(
            `Employee Department with ID: ${data.currentCompanyDepartmentId} not found.`,
          );
        }
      }

      const folder = `employees/${employeeId}`;
      const photoUrl = await this.uploadFile(photo, `${folder}/photo`);
      const aadhaarUrl = await this.uploadFile(aadhaar, `${folder}/aadhaar`);
      const panCardUrl = await this.uploadFile(panCard, `${folder}/panCard`);
      const bankPassbookUrl = await this.uploadFile(
        bankPassbook,
        `${folder}/bankPassbook`,
      );
      const markSheetUrl = await this.uploadFile(
        markSheet,
        `${folder}/markSheet`,
      );
      const otherDocumentUrl = await this.uploadFile(
        otherDocument,
        `${folder}/otherDocument`,
      );

      const employeeData: IEmployee = {
        id: employeeId,
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        currentCompanyEmployeeDesignationName: designation.name,
        currentCompanyEmployeeDepartmentName: employeeDepartment.name,
        mobileNumber: data.mobileNumber,
        currentCompanyId: data.currentCompanyId || null,
        currentCompanyDesignationId: data.currentCompanyDesignationId || null,
        currentCompanyDepartmentId: data.currentCompanyDepartmentId || null,
        currentCompanySalary: data.currentCompanySalary || null,
        currentCompanyJoiningDate: data.currentCompanyJoiningDate || null,
        currentCompanyName: company.name || null,
        recruitedBy: data.recruitedBy,
        status: data.status,
        gender: data.gender,
        fatherName: data.fatherName,
        motherName: data.motherName,
        husbandName: data.husbandName,
        category: data.category,
        dateOfBirth: data.dateOfBirth,
        age: age,
        employeeOnboardingDate: data.employeeOnboardingDate,
        highestEducationQualification: data.highestEducationQualification,
        bloodGroup: data.bloodGroup,
        permanentAddress: data.permanentAddress,
        presentAddress: data.presentAddress,
        city: data.city,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        referenceName: data.referenceName,
        referenceAddress: data.referenceAddress,
        referenceNumber: data.referenceNumber,
        bankAccountNumber: data.bankAccountNumber,
        ifscCode: data.ifscCode,
        bankCity: data.bankCity,
        bankName: data.bankName,
        pfUanNumber: data.pfUanNumber,
        esicNumber: data.esicNumber,
        policeVerificationNumber: data.policeVerificationNumber,
        policeVerificationDate: data.policeVerificationDate,
        trainingCertificateNumber: data.trainingCertificateNumber,
        trainingCertificateDate: data.trainingCertificateDate,
        medicalCertificateNumber: data.medicalCertificateNumber,
        medicalCertificateDate: data.medicalCertificateDate,
        photoUpload: photoUrl || '',
        aadhaarUpload: aadhaarUrl || '',
        panCardUpload: panCardUrl || '',
        bankPassbook: bankPassbookUrl || '',
        markSheet: markSheetUrl || '',
        otherDocument: otherDocumentUrl || '',
        aadhaarNumber: data.aadhaarNumber,
      };

      const employee = await this.employeeRepository.createEmployee(
        employeeData,
      );
      return {
        message: 'Employee created successfully',
        data: employee,
      };
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
    panCard?: Express.Multer.File,
    bankPassbook?: Express.Multer.File,
    markSheet?: Express.Multer.File,
    otherDocument?: Express.Multer.File,
  ): Promise<Employee | any> {
    try {
      const existingEmployee = await this.employeeRepository.getEmployeeById(
        id,
      );
      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      let company;
      if (data.currentCompanyId) {
        company = await this.companyRepository.findById(data.currentCompanyId);
        if (!company) {
          throw new NotFoundException(
            `Company with ID ${data.currentCompanyId} not found.`,
          );
        }
      }
      data.companyName = company.name;
      const employeeId = existingEmployee.id;
      let name;

      if (data.firstName && data.lastName) {
        name = `${data.firstName}_${data.lastName}_${employeeId}`;
      } else if (data.firstName) {
        name = `${data.firstName}_${existingEmployee.lastName}_${employeeId}`;
      } else if (data.lastName) {
        name = `${existingEmployee.firstName}_${data.lastName}_${employeeId}`;
      } else {
        name = `${existingEmployee.firstName}_${existingEmployee.lastName}_${employeeId}`;
      }

      const folder = `employees/${id}`;

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

      existingEmployee.photoUpload = await updateFile(
        photo,
        existingEmployee.photoUpload,
        'photo',
      );
      existingEmployee.aadhaarUpload = await updateFile(
        aadhaar,
        existingEmployee.aadhaarUpload,
        'aadhaar',
      );
      existingEmployee.panCardUpload = await updateFile(
        panCard,
        existingEmployee.panCardUpload,
        'panCard',
      );
      existingEmployee.bankPassbook = await updateFile(
        bankPassbook,
        existingEmployee.bankPassbook,
        'bankPassbook',
      );
      existingEmployee.markSheet = await updateFile(
        markSheet,
        existingEmployee.markSheet,
        'markSheet',
      );
      existingEmployee.otherDocument = await updateFile(
        otherDocument,
        existingEmployee.otherDocument,
        'otherDocument',
      );

      // Check if all required fields are present
      if (
        data.currentCompanyId &&
        data.currentCompanyDesignationId &&
        data.currentCompanyDepartmentId &&
        data.currentCompanySalary
      ) {
        await this.updateEmploymentHistory(id, data);
      } else {
        throw new BadRequestException(
          'All fields (currentCompanyId, currentCompanyDesignationId, currentCompanyDepartmentId, currentCompanySalary) must be provided.',
        );
      }

      // Update other fields from DTO
      existingEmployee.title = data.title ?? existingEmployee.title;
      existingEmployee.firstName = data.firstName ?? existingEmployee.firstName;
      existingEmployee.lastName = data.lastName ?? existingEmployee.lastName;
      existingEmployee.status = data.status ?? existingEmployee.status;
      existingEmployee.employeeRelievingDate =
        data.employeeRelievingDate ?? existingEmployee.employeeRelievingDate;
      existingEmployee.mobileNumber =
        data.mobileNumber ?? existingEmployee.mobileNumber;
      existingEmployee.recruitedBy =
        data.recruitedBy ?? existingEmployee.recruitedBy;
      existingEmployee.gender = data.gender ?? existingEmployee.gender;
      existingEmployee.fatherName =
        data.fatherName ?? existingEmployee.fatherName;
      existingEmployee.motherName =
        data.motherName ?? existingEmployee.motherName;
      existingEmployee.husbandName =
        data.husbandName ?? existingEmployee.husbandName;
      existingEmployee.category = data.category ?? existingEmployee.category;
      existingEmployee.dateOfBirth =
        data.dateOfBirth ?? existingEmployee.dateOfBirth;
      existingEmployee.age = data.age ?? existingEmployee.age;
      existingEmployee.employeeOnboardingDate =
        data.employeeOnboardingDate ?? existingEmployee.employeeOnboardingDate;
      existingEmployee.highestEducationQualification =
        data.highestEducationQualification ??
        existingEmployee.highestEducationQualification;
      existingEmployee.bloodGroup =
        data.bloodGroup ?? existingEmployee.bloodGroup;
      existingEmployee.permanentAddress =
        data.permanentAddress ?? existingEmployee.permanentAddress;
      existingEmployee.presentAddress =
        data.presentAddress ?? existingEmployee.presentAddress;
      existingEmployee.city = data.city ?? existingEmployee.city;
      existingEmployee.district = data.district ?? existingEmployee.district;
      existingEmployee.state = data.state ?? existingEmployee.state;
      existingEmployee.pincode = data.pincode ?? existingEmployee.pincode;
      existingEmployee.referenceName =
        data.referenceName ?? existingEmployee.referenceName;
      existingEmployee.referenceAddress =
        data.referenceAddress ?? existingEmployee.referenceAddress;
      existingEmployee.referenceNumber =
        data.referenceNumber ?? existingEmployee.referenceNumber;
      existingEmployee.bankAccountNumber =
        data.bankAccountNumber ?? existingEmployee.bankAccountNumber;
      existingEmployee.ifscCode = data.ifscCode ?? existingEmployee.ifscCode;
      existingEmployee.bankCity = data.bankCity ?? existingEmployee.bankCity;
      existingEmployee.bankName = data.bankName ?? existingEmployee.bankName;
      existingEmployee.pfUanNumber =
        data.pfUanNumber ?? existingEmployee.pfUanNumber;
      existingEmployee.esicNumber =
        data.esicNumber ?? existingEmployee.esicNumber;
      existingEmployee.policeVerificationNumber =
        data.policeVerificationNumber ??
        existingEmployee.policeVerificationNumber;
      existingEmployee.policeVerificationDate =
        data.policeVerificationDate ?? existingEmployee.policeVerificationDate;
      existingEmployee.trainingCertificateNumber =
        data.trainingCertificateNumber ??
        existingEmployee.trainingCertificateNumber;
      existingEmployee.trainingCertificateDate =
        data.trainingCertificateDate ??
        existingEmployee.trainingCertificateDate;
      existingEmployee.medicalCertificateNumber =
        data.medicalCertificateNumber ??
        existingEmployee.medicalCertificateNumber;
      existingEmployee.medicalCertificateDate =
        data.medicalCertificateDate ?? existingEmployee.medicalCertificateDate;
      existingEmployee.aadhaarNumber =
        data.aadhaarNumber ?? existingEmployee.aadhaarNumber;

      const updatedEmployee = await this.employeeRepository.updateEmployee(
        id,
        existingEmployee,
      );

      return {
        message: 'Employee updated successfully',
        data: updatedEmployee,
      };
    } catch (error) {
      this.logger.error(
        `Error in updating employee with ID: ${id} with error ${error.message}`,
      );
      throw error;
    }
  }

  async getEmploymentHistory(employeeId: string) {
    try {
      const existingEmployee = await this.employeeRepository.getEmployeeById(
        employeeId,
      );
      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
      const employmentHistory =
        await this.employeeRepository.getEmploymentHistory(employeeId);
      return {
        message: 'Employment history fetched successfully',
        data: employmentHistory,
      };
    } catch (error) {
      this.logger.error(
        `Error in getting employee history with error ${error.message}`,
      );
      throw error;
    }
  }

  private async updateEmploymentHistory(
    employeeId: string,
    data: UpdateEmployeeDto,
  ): Promise<void> {
    await this.employeeRepository.closeCurrentEmploymentHistory(employeeId);
    await this.employeeRepository.createEmploymentHistory({
      employeeId,
      companyId: data.currentCompanyId,
      designationId: data.currentCompanyDesignationId,
      departmentId: data.currentCompanyDepartmentId,
      salary: data.currentCompanySalary,
      joiningDate: data.currentCompanyJoiningDate,
      companyName: data.companyName,
    });
  }

  private extractKeyFromUrl(url: string): string {
    if (!url) {
      return null;
    }
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/');
  }

  private async uploadFiles(
    files: any,
    folder: string,
  ): Promise<Partial<Employee>> {
    const fileUrls: Partial<Employee> = {};
    for (const [key, file] of Object.entries(files)) {
      if (file) {
        fileUrls[key] = await this.awsS3Service.uploadFile(
          file,
          `${folder}/${key}`,
        );
      }
    }
    return fileUrls;
  }

  private async updateFiles(
    files: Express.Multer.File,
    folder: string,
    existingEmployee: Employee,
  ): Promise<Partial<Employee>> {
    const fileUrls: Partial<Employee> = {};
    for (const [key, file] of Object.entries(files)) {
      if (file) {
        if (existingEmployee[key]) {
          await this.awsS3Service.deleteFile(
            this.extractKeyFromUrl(existingEmployee[key]),
          );
        }
        fileUrls[key] = await this.awsS3Service.uploadFile(
          file,
          `${folder}/${key}`,
        );
      }
    }
    return fileUrls;
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

  async deleteEmployeeById(
    id: string,
  ): Promise<{ message: string; data: any }> {
    try {
      const employeeResponse = await this.employeeRepository.getEmployeeById(
        id,
      );
      if (!employeeResponse) {
        throw new NotFoundException(`Employee with ID: ${id} not found.`);
      }

      const deleteFile = async (fileUrl: string) => {
        const key = this.extractKeyFromUrl(fileUrl);
        if (key) {
          await this.awsS3Service.deleteFile(key);
        }
      };

      await deleteFile(employeeResponse.photoUpload);
      await deleteFile(employeeResponse.aadhaarUpload);
      await deleteFile(employeeResponse.panCardUpload);
      await deleteFile(employeeResponse.bankPassbook);
      await deleteFile(employeeResponse.markSheet);
      await deleteFile(employeeResponse.otherDocument);

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

        const deleteFile = async (fileUrl: string) => {
          const key = this.extractKeyFromUrl(fileUrl);
          if (key) {
            await this.awsS3Service.deleteFile(key);
          }
        };

        await deleteFile(employee.photoUpload);
        await deleteFile(employee.aadhaarUpload);
        await deleteFile(employee.panCardUpload);
        await deleteFile(employee.bankPassbook);
        await deleteFile(employee.markSheet);
        await deleteFile(employee.otherDocument);

        await this.employeeRepository.deleteEmployeeById(id);
      }
      return { message: 'Employees deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting employees: ${error.message}`);
      throw error;
    }
  }

  async getAllEmployees(
    queryParams: GetAllEmployeesDto,
  ): Promise<Employee[] | any> {
    try {
      const employees = await this.employeeRepository.getAllEmployees(
        queryParams,
      );
      return {
        message: 'Employee fetched successfully',
        data: employees,
      };
    } catch (error) {
      this.logger.error(
        `Error in fetching all employees with error ${error.message}`,
      );
      throw error;
    }
  }

  private async uploadFile(
    file: Express.Multer.File,
    folderPath: string,
  ): Promise<string | null> {
    if (file) {
      return await this.awsS3Service.uploadFile(file, folderPath);
    }
    return null;
  }

  private calculateAge(dateOfBirth: string): number {
    const parts = dateOfBirth.split('-');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-indexed in JavaScript dates
    const year = parseInt(parts[2], 10);

    const birthDate = new Date(year, month, day);
    const today = new Date(); // This gets the current date and time

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  private generateEmployeeId(): string {
    const random4DigitNumber = Math.floor(
      1000 + Math.random() * 9000,
    ).toString();
    return `TSS${random4DigitNumber}`;
  }
}
