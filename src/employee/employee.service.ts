import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeRepository } from './employee.repository';
import { AwsS3Service } from '../aws/aws-s3.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import {
  UpdateEmployeeAdditionalDetailsDto,
  UpdateEmployeeBankDetailsDto,
  UpdateEmployeeContactDetailsDto,
  UpdateEmployeeDocumentUploadsDto,
  UpdateEmployeeDto,
  UpdateEmployeeReferenceDetailsDto,
} from './dto/update-employee.dto';
import {
  Employee,
  EmployeeDocumentUploads,
  EmploymentHistory,
} from '@prisma/client';
import { IEmployee } from './interface/employee.interface';
import { CompanyRepository } from 'src/company/company.repository';
import { DesignationRepository } from 'src/designations/designation.repository';
import { DepartmentRepository } from 'src/departments/department.repository';
import { GetAllEmployeesDto } from './dto/get-all-employees.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateEmploymentHistoryDto,
  UpdateEmploymentHistoryDto,
} from './dto/employment-history.dto';

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
        photo: photoUrl || '',
        aadhaar: aadhaarUrl || '',
        panCard: panCardUrl || '',
        bankPassbook: bankPassbookUrl || '',
        markSheet: markSheetUrl || '',
        otherDocument: otherDocumentUrl || '',
        otherDocumentRemarks: data.otherDocumentRemarks || '',
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
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<{ message: string; data: Employee }> {
    try {
      const updateResponse = await this.employeeRepository.updateEmployee(
        id,
        updateEmployeeDto,
      );
      return {
        message: 'Employee updated successfully',
        data: updateResponse,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      throw error;
    }
  }

  async updateEmployeeContactDetails(
    id: string,
    updateDto: UpdateEmployeeContactDetailsDto,
  ) {
    try {
      const updateResponse =
        await this.employeeRepository.updateEmployeeContactDetails(
          id,
          updateDto,
        );
      return {
        message: 'Employee updated successfully',
        data: updateResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateEmployeeBankDetails(
    id: string,
    updateDto: UpdateEmployeeBankDetailsDto,
  ) {
    try {
      const updateResponse =
        await this.employeeRepository.updateEmployeeBankDetails(id, updateDto);
      return {
        message: 'Employee updated successfully',
        data: updateResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateEmployeeAdditionalDetails(
    id: string,
    updateDto: UpdateEmployeeAdditionalDetailsDto,
  ) {
    try {
      const updateResponse =
        await this.employeeRepository.updateEmployeeAdditionalDetails(
          id,
          updateDto,
        );
      return {
        message: 'Employee updated successfully',
        data: updateResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateEmployeeReferenceDetails(
    id: string,
    updateDto: UpdateEmployeeReferenceDetailsDto,
  ) {
    try {
      const updateResponse =
        await this.employeeRepository.updateEmployeeReferenceDetails(
          id,
          updateDto,
        );
      return {
        message: 'Employee updated successfully',
        data: updateResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateEmployeeDocumentUploads(
    id: string,
    updateDto: UpdateEmployeeDocumentUploadsDto,
  ): Promise<{ message: string; data: EmployeeDocumentUploads }> {
    const currentDocuments =
      await this.employeeRepository.getEmployeeDocumentUploads(id);

    if (!currentDocuments) {
      throw new NotFoundException(
        `Document uploads for employee with ID ${id} not found`,
      );
    }

    const folder = `employees/${id}`;
    const updatedData: Partial<EmployeeDocumentUploads> = {};

    const fileTypes = [
      'photo',
      'aadhaar',
      'panCard',
      'bankPassbook',
      'markSheet',
      'otherDocument',
    ];

    for (const fileType of fileTypes) {
      if (updateDto[fileType]) {
        // Delete the old file if it exists
        if (currentDocuments[fileType]) {
          const oldKey = currentDocuments[fileType].split('/').pop();
          await this.awsS3Service.deleteFile(`${folder}/${oldKey}`);
        }

        // Upload the new file
        const newUrl = await this.awsS3Service.uploadFile(
          updateDto[fileType],
          `${folder}/${fileType}`,
        );
        updatedData[fileType] = newUrl;
      }
    }

    if (updateDto.otherDocumentRemarks !== undefined) {
      updatedData.otherDocumentRemarks = updateDto.otherDocumentRemarks;
    }

    const updateResponse =
      await this.employeeRepository.updateEmployeeDocumentUploads(
        id,
        updatedData,
      );

    return {
      message: 'Employee data updated successfully!',
      data: updateResponse,
    };
  }

  async createEmploymentHistory(
    createDto: CreateEmploymentHistoryDto,
  ): Promise<{ message: string; data: EmploymentHistory }> {
    const {
      employeeId,
      companyId,
      designationId,
      departmentId,
      salary,
      joiningDate,
      status,
    } = createDto;
    const currentEmployment =
      await this.employeeRepository.getCurrentEmploymentHistory(
        createDto.employeeId,
      );
    if (currentEmployment) {
      throw new BadRequestException(
        'Employee already has an active employment record',
      );
    }

    const companyResponse = await this.companyRepository.findById(
      createDto.companyId,
    );
    if (!companyResponse) {
      throw new NotFoundException(`No company found with ID: ${companyId}`);
    }

    const designationResponse = await this.designationRepository.getById(
      designationId,
    );
    if (!designationResponse) {
      throw new NotFoundException(
        `No designation found with ID: ${designationId}`,
      );
    }

    const departmentResponse =
      await this.departmentRepository.getEmployeeDepartmentById(departmentId);
    if (!departmentResponse) {
      throw new NotFoundException(
        `No department found with ID: ${departmentId}`,
      );
    }

    const saveEmploymentHistoryPayload = {
      employeeId,
      companyId,
      designationId,
      departmentId,
      salary,
      joiningDate,
      companyName: companyResponse.name,
      departmentName: designationResponse.name,
      designationName: designationResponse.name,
      status: status,
    };
    const saveResponse = await this.employeeRepository.createEmploymentHistory(
      saveEmploymentHistoryPayload,
    );
    return {
      message: 'Employment record created successfully!',
      data: saveResponse,
    };
  }

  async updateEmploymentHistory(
    id: string,
    updateDto: UpdateEmploymentHistoryDto,
  ): Promise<{ message: string; data: EmploymentHistory }> {
    try {
      const updateResponse =
        await this.employeeRepository.updateEmploymentHistory(id, updateDto);
      console.log(updateResponse);
      return {
        message: 'Employment history updated successfully!',
        data: updateResponse,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Employment history record with ID ${id} not found`,
        );
      }
      throw error;
    }
  }

  async closeCurrentEmployment(
    employeeId: string,
    leavingDate: string,
  ): Promise<{ message: string; data: EmploymentHistory }> {
    const currentEmployment =
      await this.employeeRepository.getCurrentEmploymentHistory(employeeId);
    console.log(currentEmployment);
    if (!currentEmployment) {
      throw new NotFoundException(
        `No active employment found for employee with ID ${employeeId}`,
      );
    }
    const closeResponse = await this.employeeRepository.updateEmploymentHistory(
      currentEmployment.id,
      { leavingDate, status: 'INACTIVE' },
    );
    return {
      message: `Employee's current employment closed`,
      data: closeResponse,
    };
  }

  async getEmploymentHistory(
    employeeId: string,
  ): Promise<{ message: string; data: EmploymentHistory[] }> {
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

  async updateCurrentEmploymentHistory(
    id: string,
    data: Partial<EmploymentHistory>,
  ) {
    const response =
      await this.employeeRepository.updateCurrentEmploymentHistory(id, data);
    return {
      message: 'The employment history has been successfully updated.',
      data: response,
    };
  }

  async getActiveEmployment(employeeId: string) {
    const response = await this.employeeRepository.findActiveByEmployeeId(
      employeeId,
    );
    if (!response) {
      throw new NotFoundException(`No active employment found`);
    }
    return {
      message: 'The active employment has been successfully retrieved.',
      data: response,
    };
  }

  private extractKeyFromUrl(url: string): string {
    if (!url) {
      return null;
    }
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/');
  }

  async getEmployeeById(
    id: string,
  ): Promise<{ message: string; data: Employee }> {
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

      await deleteFile(employeeResponse.photo);
      await deleteFile(employeeResponse.aadhaar);
      await deleteFile(employeeResponse.panCard);
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

        await deleteFile(employee.photo);
        await deleteFile(employee.aadhaar);
        await deleteFile(employee.panCard);
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
