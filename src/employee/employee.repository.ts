import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee, EmploymentHistory } from '@prisma/client';
import { IEmployee } from './interface/employee.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetAllEmployeesDto } from './dto/get-all-employees.dto';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(data: IEmployee): Promise<any> {
    try {
      const employeeData: any = {
        id: data.id,
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        mobileNumber: data.mobileNumber,
        recruitedBy: data.recruitedBy,
        gender: data.gender,
        status: data.status,
        fatherName: data.fatherName,
        motherName: data.motherName,
        husbandName: data.husbandName,
        category: data.category,
        dateOfBirth: data.dateOfBirth,
        age: data.age,
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
        photoUpload: data.photoUpload,
        aadhaarUpload: data.aadhaarUpload,
        panCardUpload: data.panCardUpload,
        bankPassbook: data.bankPassbook,
        markSheet: data.markSheet,
        otherDocument: data.otherDocument,
        aadhaarNumber: data.aadhaarNumber,
      };

    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the employee
      const employeeResponse = await prisma.employee.create({
        data: employeeData,
      });

      // If company information is provided, create an employment history entry
      if (data.currentCompanyId) {
        employeeData.currentCompanyId = data.currentCompanyId;
        employeeData.currentCompanyName = data.currentCompanyName;
        employeeData.currentCompanyDepartmentId = data.currentCompanyDepartmentId;
        employeeData.currentCompanyEmployeeDepartmentName = data.currentCompanyEmployeeDepartmentName;
        employeeData.currentCompanyDesignationId = data.currentCompanyDesignationId;
        employeeData.currentCompanyEmployeeDesignationName = data.currentCompanyEmployeeDesignationName;
        employeeData.currentCompanySalary = data.currentCompanySalary;
        employeeData.currentCompanyJoiningDate = data.currentCompanyJoiningDate;

        await prisma.employmentHistory.create({
          data: {
            employeeId: employeeResponse.id,
            companyId: data.currentCompanyId,
            designationId: data.currentCompanyDesignationId,
            departmentId: data.currentCompanyDepartmentId,
            salary: data.currentCompanySalary,
            joiningDate: data.currentCompanyJoiningDate,
            companyName: data.currentCompanyName,
          }
        });
      }

      return employeeResponse;
    });

    return result;
    } catch (error) {
      new Logger().debug(error.message);
      throw error;
    }
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    try {
      return await this.prisma.employee.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async createEmploymentHistory(data: any): Promise<EmploymentHistory> {
    try {
      return await this.prisma.employmentHistory.create({ data });
    } catch (error) {
      // this.logger.error(`Error creating employment history: ${error.message}`);
      throw error;
    }
  }
  
  async closeCurrentEmploymentHistory(employeeId: string): Promise<void> {
    try {
      const now = new Date();

      const formattedLeavingDate = new Intl.DateTimeFormat('en-GB').format(now).split('/').join('-'); // Formats date as DD-MM-YYYY

      await this.prisma.employmentHistory.updateMany({
        where: { 
          employeeId,
          leavingDate: null
        },
        data: { leavingDate: formattedLeavingDate },
      });
    } catch (error) {
      // this.logger.error(`Error closing current employment history for employee ${employeeId}: ${error.message}`);
      throw error;
    }
  }

  async getEmployeeById(id: string) {
    try {
      const employeeResponse = await this.prisma.employee.findUnique({
        where: { id },
        select: {
          employmentHistories: true
        }
      });
      return employeeResponse;
    } catch (error) {
      return error;
    }
  }
  async findByIdWithCurrentEmployment(id: string): Promise<Employee | null> {
    try {
      return await this.prisma.employee.findUnique({
        where: { id },
        include: {
          employmentHistories: {
            orderBy: { joiningDate: 'desc' },
            take: 1,
            include: {
              company: true,
              designation: true,
              department: true,
            },
          },
        },
      });
    } catch (error) {
      // this.logger.error(`Error finding employee ${id} with current employment: ${error.message}`, error.stack);
      throw error;
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

  async getEmploymentHistory(employeeId: string) {
    try {
      const employementHistory = await this.prisma.employmentHistory.findMany({
        where: {
          employeeId,
        }
      });
      return employementHistory;
    } catch (error) {
      return error;
    }
  }

  async getAllEmployees(params: GetAllEmployeesDto) {
    try {
      const {
        page,
        limit,
        searchText,
        designationId,
        employeeDepartmentId,
        companyId,
        gender,
        category,
        highestEducationQualification,
        minAge,
        maxAge,
        sortBy,
        sortOrder,
        startDate,
        endDate,
      } = params;
  
      const where: any = {};
      if (searchText) {
        where.OR = [
          { firstName: { contains: searchText, mode: 'insensitive' } },
          { lastName: { contains: searchText, mode: 'insensitive' } },
          { id: { contains: searchText, mode: 'insensitive' } },
        ];
      }
      if (designationId) where.designationId = designationId;
      if (employeeDepartmentId) where.employeeDepartmentId = employeeDepartmentId;
      if (companyId) where.companyId = companyId;
      if (gender) where.gender = gender;
      if (category) where.category = category;
      if (highestEducationQualification) where.highestEducationQualification = highestEducationQualification;
      if (minAge || maxAge) {
        where.age = {};
        if (minAge) where.age.gte = minAge;
        if (maxAge) where.age.lte = maxAge;
      }
      if (startDate || endDate) {
        where.dateOfJoining = {};
        if (startDate) where.dateOfJoining.gte = startDate;
        if (endDate) where.dateOfJoining.lte = endDate;
      }
  
      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy] = sortOrder || 'asc';
      }
  
      const [data, total] = await Promise.all([
        this.prisma.employee.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            employmentHistories: {
              orderBy: { joiningDate: 'desc' },
              take: 1,
              include: {
                company: true,
                designation: true,
                department: true,
              },
            },
          },
        }),
        this.prisma.employee.count({ where }),
      ]);
  
      return { data, total };
    } catch (error) {
      console.error(error);
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
