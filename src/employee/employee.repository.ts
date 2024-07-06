import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee } from '@prisma/client';
import { IEmployee } from './interface/employee.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetAllEmployeesDto } from './dto/get-all-employees.dto';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(data: IEmployee): Promise<any> {
    try {
      const employeeResponse = await this.prisma.employee.create({
        data: {
          id: data.id,
          title: data.title,
          firstName: data.firstName,
          lastName: data.lastName,
          designationId: data.designationId,
          designationName: data.designationName,
          employeeDepartmentId: data.employeeDepartmentId,
          employeeDepartmentName: data.employeeDepartmentName,
          mobileNumber: data.mobileNumber,
          companyName: data.companyName,
          companyId: data.companyId,
          recruitedBy: data.recruitedBy,
          gender: data.gender,
          fatherName: data.fatherName,
          motherName: data.motherName,
          husbandName: data.husbandName,
          category: data.category,
          dateOfBirth: data.dateOfBirth,
          age: data.age,
          dateOfJoining: data.dateOfJoining,
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
          salary: data.salary,
          aadhaarNumber: data.aadhaarNumber,
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
            designation: true,
            department: true,
            company: true,
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
