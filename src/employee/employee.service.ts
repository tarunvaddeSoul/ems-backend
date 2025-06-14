import {
  BadRequestException,
  HttpStatus,
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
  EmployeeAdditionalDetails,
  EmployeeBankDetails,
  EmployeeContactDetails,
  EmployeeDocumentUploads,
  EmployeeReferenceDetails,
  EmploymentHistory,
} from '@prisma/client';
import { IEmployee } from './interface/employee.interface';
import { CompanyRepository } from 'src/company/company.repository';
import { DesignationRepository } from 'src/designations/designation.repository';
import { DepartmentRepository } from 'src/departments/department.repository';
import { GetAllEmployeesDto } from './dto/get-all-employees.dto';
import {
  CreateEmploymentHistoryDto,
  UpdateEmploymentHistoryDto,
} from './dto/employment-history.dto';
import { IResponse } from 'src/types/response.interface';

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
  ): Promise<IResponse<Employee>> {
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
      let company;
      if (data.currentCompanyId) {
        company = await this.companyRepository.findById(data.currentCompanyId);
        if (!company) {
          throw new NotFoundException(
            `Company with ID ${data.currentCompanyId} not found.`,
          );
        }
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
        currentCompanyEmployeeDesignationName: designation?.name || null,
        currentCompanyEmployeeDepartmentName: employeeDepartment?.name || null,
        mobileNumber: data.mobileNumber,
        currentCompanyId: data.currentCompanyId || null,
        currentCompanyDesignationId: data.currentCompanyDesignationId || null,
        currentCompanyDepartmentId: data.currentCompanyDepartmentId || null,
        currentCompanySalary: data.currentCompanySalary || null,
        currentCompanyJoiningDate: data.currentCompanyJoiningDate || null,
        currentCompanyName: company?.name || null,
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
      if (!employee) {
        throw new BadRequestException('Failed to create employee');
      }

      return {
        statusCode: HttpStatus.CREATED,
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
  ): Promise<IResponse<Employee>> {
    try {
      const existingEmployee = await this.employeeRepository.getEmployeeById(
        id,
      );
      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID: ${id} not found.`);
      }
      const updateResponse = await this.employeeRepository.updateEmployee(
        id,
        updateEmployeeDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee updated successfully',
        data: updateResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateEmployeeContactDetails(
    id: string,
    updateDto: UpdateEmployeeContactDetailsDto,
  ): Promise<IResponse<EmployeeContactDetails>> {
    try {
      const updateResponse =
        await this.employeeRepository.updateEmployeeContactDetails(
          id,
          updateDto,
        );
      return {
        statusCode: HttpStatus.OK,
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
  ): Promise<IResponse<EmployeeBankDetails>> {
    try {
      const updateResponse =
        await this.employeeRepository.updateEmployeeBankDetails(id, updateDto);
      return {
        statusCode: HttpStatus.OK,
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
  ): Promise<IResponse<EmployeeAdditionalDetails>> {
    try {
      const updateResponse =
        await this.employeeRepository.updateEmployeeAdditionalDetails(
          id,
          updateDto,
        );
      return {
        statusCode: HttpStatus.OK,
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
  ): Promise<IResponse<EmployeeReferenceDetails>> {
    try {
      const updateResponse =
        await this.employeeRepository.updateEmployeeReferenceDetails(
          id,
          updateDto,
        );
      return {
        statusCode: HttpStatus.OK,
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
  ): Promise<IResponse<EmployeeDocumentUploads>> {
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
      statusCode: HttpStatus.OK,
      message: 'Employee data updated successfully!',
      data: updateResponse,
    };
  }

  async createEmploymentHistory(
    createDto: CreateEmploymentHistoryDto,
  ): Promise<IResponse<EmploymentHistory>> {
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
      statusCode: HttpStatus.CREATED,
      message: 'Employment record created successfully!',
      data: saveResponse,
    };
  }

  async updateEmploymentHistory(
    id: string,
    updateDto: UpdateEmploymentHistoryDto,
  ): Promise<IResponse<EmploymentHistory>> {
    try {
      const existingEmploymentHistory =
        await this.employeeRepository.getCurrentEmploymentHistory(id);
      if (!existingEmploymentHistory) {
        throw new NotFoundException(
          `Employment history with ID: ${id} not found.`,
        );
      }
      const updateResponse =
        await this.employeeRepository.updateEmploymentHistory(id, updateDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Employment history updated successfully!',
        data: updateResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async closeCurrentEmployment(
    employeeId: string,
    leavingDate: string,
  ): Promise<IResponse<EmploymentHistory>> {
    const currentEmployment =
      await this.employeeRepository.getCurrentEmploymentHistory(employeeId);

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
      statusCode: HttpStatus.OK,
      message: `Employee's current employment closed`,
      data: closeResponse,
    };
  }

  async getEmploymentHistory(
    employeeId: string,
  ): Promise<IResponse<EmploymentHistory[]>> {
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
        statusCode: HttpStatus.OK,
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

  async getEmployeeContactDetails(
    employeeId: string,
  ): Promise<IResponse<EmployeeContactDetails>> {
    try {
      const existingEmployee = await this.employeeRepository.getEmployeeById(
        employeeId,
      );
      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
      const contactDetails =
        await this.employeeRepository.getEmployeeContactDetails(employeeId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee contact details fetched successfully',
        data: contactDetails,
      };
    } catch (error) {
      this.logger.error(
        `Error in getting employee contact details: ${error.message}`,
      );
      throw error;
    }
  }

  async getEmployeeBankDetails(
    employeeId: string,
  ): Promise<IResponse<EmployeeBankDetails>> {
    try {
      const existingEmployee = await this.employeeRepository.getEmployeeById(
        employeeId,
      );
      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
      const bankDetails = await this.employeeRepository.getEmployeeBankDetails(
        employeeId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee bank details fetched successfully',
        data: bankDetails,
      };
    } catch (error) {
      this.logger.error(
        `Error in getting employee bank details: ${error.message}`,
      );
      throw error;
    }
  }

  async getEmployeeAdditionalDetails(
    employeeId: string,
  ): Promise<IResponse<EmployeeAdditionalDetails>> {
    try {
      const existingEmployee = await this.employeeRepository.getEmployeeById(
        employeeId,
      );
      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
      const additionalDetails =
        await this.employeeRepository.getEmployeeAdditionalDetails(employeeId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee additional details fetched successfully',
        data: additionalDetails,
      };
    } catch (error) {
      this.logger.error(
        `Error in getting employee additional details: ${error.message}`,
      );
      throw error;
    }
  }

  async getEmployeeReferenceDetails(
    employeeId: string,
  ): Promise<IResponse<EmployeeReferenceDetails>> {
    try {
      const existingEmployee = await this.employeeRepository.getEmployeeById(
        employeeId,
      );
      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
      const referenceDetails =
        await this.employeeRepository.getEmployeeReferenceDetails(employeeId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee reference details fetched successfully',
        data: referenceDetails,
      };
    } catch (error) {
      this.logger.error(
        `Error in getting employee reference details: ${error.message}`,
      );
      throw error;
    }
  }

  async getEmployeeDocumentUploads(
    employeeId: string,
  ): Promise<IResponse<EmployeeDocumentUploads>> {
    try {
      const existingEmployee = await this.employeeRepository.getEmployeeById(
        employeeId,
      );
      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
      const documentUploads =
        await this.employeeRepository.getEmployeeDocumentUploads(employeeId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee document uploads fetched successfully',
        data: documentUploads,
      };
    } catch (error) {
      this.logger.error(
        `Error in getting employee document uploads: ${error.message}`,
      );
      throw error;
    }
  }

  async updateCurrentEmploymentHistory(
    id: string,
    data: Partial<EmploymentHistory>,
  ): Promise<IResponse<EmploymentHistory>> {
    const existingEmploymentHistory =
      await this.employeeRepository.getCurrentEmploymentHistory(id);
    if (!existingEmploymentHistory) {
      throw new NotFoundException(
        `Employment history with ID: ${id} not found.`,
      );
    }
    const response =
      await this.employeeRepository.updateCurrentEmploymentHistory(id, data);
    return {
      statusCode: HttpStatus.OK,
      message: 'The employment history has been successfully updated.',
      data: response,
    };
  }

  async getActiveEmployment(
    employeeId: string,
  ): Promise<IResponse<EmploymentHistory>> {
    const response = await this.employeeRepository.findActiveByEmployeeId(
      employeeId,
    );
    if (!response) {
      throw new NotFoundException(`No active employment found`);
    }
    return {
      statusCode: HttpStatus.OK,
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

  async getEmployeeById(id: string): Promise<IResponse<Employee>> {
    try {
      const employeeResponse = await this.employeeRepository.getEmployeeById(
        id,
      );
      if (!employeeResponse) {
        throw new NotFoundException(`Employee with ID: ${id} not found.`);
      }
      return {
        statusCode: HttpStatus.OK,
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

  async deleteEmployeeById(id: string): Promise<IResponse<Employee>> {
    try {
      const employeeResponse = await this.employeeRepository.getEmployeeById(
        id,
      );

      if (!employeeResponse) {
        throw new NotFoundException(`Employee with ID: ${id} not found.`);
      }

      // Delete associated files
      await this.deleteEmployeeFiles(employeeResponse.documentUploads);

      const deleteEmployeeResponse =
        await this.employeeRepository.deleteEmployeeById(id);
      return {
        statusCode: HttpStatus.OK,
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

  async deleteMultipleEmployees(ids: string[]): Promise<IResponse<null>> {
    try {
      for (const id of ids) {
        const employee = await this.employeeRepository.getEmployeeById(id);
        if (!employee) {
          throw new NotFoundException(`Employee with ID ${id} not found`);
        }
        // Delete associated files
        await this.deleteEmployeeFiles(employee.documentUploads);

        await this.employeeRepository.deleteEmployeeById(id);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Employees deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting employees: ${error.message}`);
      throw error;
    }
  }

  private async deleteEmployeeFiles(
    documentUploads: EmployeeDocumentUploads | null,
  ) {
    if (!documentUploads) return;

    const filesToDelete = [
      documentUploads.photo,
      documentUploads.aadhaar,
      documentUploads.panCard,
      documentUploads.bankPassbook,
      documentUploads.markSheet,
      documentUploads.otherDocument,
    ];

    for (const fileUrl of filesToDelete) {
      if (fileUrl) {
        const key = this.extractKeyFromUrl(fileUrl);
        if (key) {
          try {
            await this.awsS3Service.deleteFile(key);
          } catch (error) {
            this.logger.warn(
              `Failed to delete file: ${key}. Error: ${error.message}`,
            );
          }
        }
      }
    }
  }

  async getAllEmployees(
    queryParams: GetAllEmployeesDto,
  ): Promise<IResponse<{ data: Employee[]; total: number }>> {
    try {
      const employees = await this.employeeRepository.getAllEmployees(
        queryParams,
      );

      // if (employees.total === 0) {
      //   throw new NotFoundException('No employees found');
      // }

      return {
        statusCode: HttpStatus.OK,
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
  ): Promise<string> {
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
