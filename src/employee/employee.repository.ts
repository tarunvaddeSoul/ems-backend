import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Employee,
  EmployeeAdditionalDetails,
  EmployeeBankDetails,
  EmployeeContactDetails,
  EmployeeDocumentUploads,
  EmployeeReferenceDetails,
  EmploymentHistory,
  Prisma,
} from '@prisma/client';
import { IEmployee } from './interface/employee.interface';
import { GetAllEmployeesDto } from './dto/get-all-employees.dto';
import { Status } from './enum/employee.enum';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(data: IEmployee): Promise<Employee> {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create the main employee record
        const employeeResponse = await prisma.employee.create({
          data: {
            id: data.id,
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            fatherName: data.fatherName,
            motherName: data.motherName,
            husbandName: data.husbandName,
            bloodGroup: data.bloodGroup,
            employeeOnboardingDate: data.employeeOnboardingDate,
            status: data.status,
            category: data.category,
            recruitedBy: data.recruitedBy,
            age: data.age,
            highestEducationQualification: data.highestEducationQualification,
          },
        });

        // Create employee contact details
        await prisma.employeeContactDetails.create({
          data: {
            employeeId: employeeResponse.id,
            mobileNumber: data.mobileNumber,
            aadhaarNumber: data.aadhaarNumber,
            permanentAddress: data.permanentAddress,
            presentAddress: data.presentAddress,
            city: data.city,
            district: data.district,
            state: data.state,
            pincode: data.pincode,
          },
        });

        // Create employee bank details
        await prisma.employeeBankDetails.create({
          data: {
            employeeId: employeeResponse.id,
            bankAccountNumber: data.bankAccountNumber,
            ifscCode: data.ifscCode,
            bankName: data.bankName,
            bankCity: data.bankCity,
          },
        });

        // Create employee additional details
        await prisma.employeeAdditionalDetails.create({
          data: {
            employeeId: employeeResponse.id,
            pfUanNumber: data.pfUanNumber,
            esicNumber: data.esicNumber,
            policeVerificationNumber: data.policeVerificationNumber,
            policeVerificationDate: data.policeVerificationDate,
            trainingCertificateNumber: data.trainingCertificateNumber,
            trainingCertificateDate: data.trainingCertificateDate,
            medicalCertificateNumber: data.medicalCertificateNumber,
            medicalCertificateDate: data.medicalCertificateDate,
          },
        });

        // Create employee reference details
        await prisma.employeeReferenceDetails.create({
          data: {
            employeeId: employeeResponse.id,
            referenceName: data.referenceName,
            referenceAddress: data.referenceAddress,
            referenceNumber: data.referenceNumber,
          },
        });

        // Create employee document uploads
        await prisma.employeeDocumentUploads.create({
          data: {
            employeeId: employeeResponse.id,
            photo: data.photo,
            aadhaar: data.aadhaar,
            panCard: data.panCard,
            bankPassbook: data.bankPassbook,
            markSheet: data.markSheet,
            otherDocument: data.otherDocument,
            otherDocumentRemarks: data.otherDocumentRemarks,
          },
        });

        // If company information is provided, create an employment history entry
        if (data.currentCompanyId) {
          await prisma.employmentHistory.create({
            data: {
              employeeId: employeeResponse.id,
              companyId: data.currentCompanyId,
              designationId: data.currentCompanyDesignationId,
              departmentId: data.currentCompanyDepartmentId,
              salary: data.currentCompanySalary,
              joiningDate: data.currentCompanyJoiningDate,
              companyName: data.currentCompanyName,
              departmentName: data.currentCompanyEmployeeDepartmentName,
              designationName: data.currentCompanyEmployeeDesignationName,
              status: Status.ACTIVE,
            },
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

  async updateEmployee(
    id: string,
    data: Prisma.EmployeeUpdateInput,
  ): Promise<Employee> {
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  async findEmployeesByCompany(companyId: string): Promise<Employee[]> {
    return this.prisma.employee.findMany({
      where: {
        employmentHistories: {
          some: {
            companyId,
          },
        },
      },
      include: {
        employmentHistories: true,
      },
    });
  }

  async updateEmployeeContactDetails(
    employeeId: string,
    data: any,
  ): Promise<EmployeeContactDetails> {
    return this.prisma.employeeContactDetails.upsert({
      where: { employeeId },
      update: data,
      create: { ...data, employeeId },
    });
  }

  async getEmployeeContactDetails(
    employeeId: string,
  ): Promise<EmployeeContactDetails> {
    return this.prisma.employeeContactDetails.findUnique({
      where: { employeeId },
    });
  }

  async updateEmployeeBankDetails(
    employeeId: string,
    data: any,
  ): Promise<EmployeeBankDetails> {
    return this.prisma.employeeBankDetails.upsert({
      where: { employeeId },
      update: data,
      create: { ...data, employeeId },
    });
  }

  async getEmployeeBankDetails(
    employeeId: string,
  ): Promise<EmployeeBankDetails> {
    return this.prisma.employeeBankDetails.findUnique({
      where: { employeeId },
    });
  }

  async updateEmployeeAdditionalDetails(
    employeeId: string,
    data: any,
  ): Promise<EmployeeAdditionalDetails> {
    return this.prisma.employeeAdditionalDetails.upsert({
      where: { employeeId },
      update: data,
      create: { ...data, employeeId },
    });
  }

  async getEmployeeAdditionalDetails(
    employeeId: string,
  ): Promise<EmployeeAdditionalDetails> {
    return this.prisma.employeeAdditionalDetails.findUnique({
      where: { employeeId },
    });
  }

  async updateEmployeeReferenceDetails(
    employeeId: string,
    data: any,
  ): Promise<EmployeeReferenceDetails> {
    return this.prisma.employeeReferenceDetails.upsert({
      where: { employeeId },
      update: data,
      create: { ...data, employeeId },
    });
  }

  async getEmployeeReferenceDetails(
    employeeId: string,
  ): Promise<EmployeeReferenceDetails> {
    return this.prisma.employeeReferenceDetails.findUnique({
      where: { employeeId },
    });
  }

  async updateEmployeeDocumentUploads(
    employeeId: string,
    data: Partial<Prisma.EmployeeDocumentUploadsUpdateInput>,
  ): Promise<EmployeeDocumentUploads> {
    const existingRecord = await this.prisma.employeeDocumentUploads.findUnique(
      {
        where: { employeeId },
      },
    );

    if (existingRecord) {
      return this.prisma.employeeDocumentUploads.update({
        where: { employeeId },
        data,
      });
    } else {
      const createData: Prisma.EmployeeDocumentUploadsCreateInput = {
        employee: { connect: { id: employeeId } },
        photo: (data.photo as string) ?? '',
        aadhaar: (data.aadhaar as string) ?? '',
        panCard: (data.panCard as string) ?? '',
        bankPassbook: (data.bankPassbook as string) ?? '',
        markSheet: (data.markSheet as string) ?? '',
        otherDocument: (data.otherDocument as string) ?? '',
        otherDocumentRemarks: (data.otherDocumentRemarks as string) ?? '',
      };
      return this.prisma.employeeDocumentUploads.create({
        data: createData,
      });
    }
  }

  async updateEmploymentHistory(
    id: string,
    data: Prisma.EmploymentHistoryUpdateInput,
  ): Promise<EmploymentHistory> {
    const updateResponse = await this.prisma.employmentHistory.update({
      where: { id },
      data,
    });
    return updateResponse;
  }

  async getEmploymentHistory(employeeId: string): Promise<EmploymentHistory[]> {
    return this.prisma.employmentHistory.findMany({
      where: { employeeId },
      orderBy: { joiningDate: 'desc' },
    });
  }

  async getCurrentEmploymentHistory(
    employeeId: string,
  ): Promise<EmploymentHistory> {
    return this.prisma.employmentHistory.findFirst({
      where: {
        employeeId,
        leavingDate: null,
      },
      orderBy: { joiningDate: 'desc' },
    });
  }

  async createEmploymentHistory(data: any): Promise<EmploymentHistory> {
    return await this.prisma.employmentHistory.create({ data });
  }

  async closeCurrentEmploymentHistory(employeeId: string): Promise<void> {
    const now = new Date();

    const formattedLeavingDate = new Intl.DateTimeFormat('en-GB')
      .format(now)
      .split('/')
      .join('-'); // Formats date as DD-MM-YYYY

    await this.prisma.employmentHistory.updateMany({
      where: {
        employeeId,
        leavingDate: null,
      },
      data: { leavingDate: formattedLeavingDate, status: Status.INACTIVE },
    });
  }

  async updateCurrentEmploymentHistory(
    id: string,
    data: Partial<EmploymentHistory>,
  ): Promise<EmploymentHistory> {
    return this.prisma.employmentHistory.update({
      where: { id },
      data,
    });
  }

  async getEmployeeDocumentUploads(
    employeeId: string,
  ): Promise<EmployeeDocumentUploads> {
    return this.prisma.employeeDocumentUploads.findUnique({
      where: { employeeId },
    });
  }

  async findActiveByEmployeeId(employeeId: string): Promise<EmploymentHistory> {
    return await this.prisma.employmentHistory.findFirst({
      where: {
        employeeId,
        status: Status.ACTIVE,
      },
      include: {
        company: true,
        designation: true,
        department: true,
      },
    });
  }

  async getEmployeeById(id: string) {
    const employeeResponse = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        contactDetails: true,
        bankDetails: true,
        additionalDetails: true,
        referenceDetails: true,
        documentUploads: true,
        employmentHistories: true,
      },
    });
    return employeeResponse;
  }

  async findByIdWithCurrentEmployment(id: string): Promise<Employee> {
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

  async getAllEmployees(
    params: GetAllEmployeesDto,
  ): Promise<{ data: Employee[]; total: number }> {
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
    if (gender && gender !== 'all') where.gender = gender;
    if (category && category !== 'all') where.category = category;
    if (highestEducationQualification)
      where.highestEducationQualification = highestEducationQualification;
    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = minAge;
      if (maxAge) where.age.lte = maxAge;
    }

    // Employment history filters
    if (
      designationId ||
      employeeDepartmentId ||
      companyId ||
      startDate ||
      endDate
    ) {
      where.employmentHistories = {
        some: {
          AND: [
            designationId ? { designationId } : {},
            employeeDepartmentId ? { departmentId: employeeDepartmentId } : {},
            companyId ? { companyId } : {},
            startDate || endDate
              ? {
                  OR: [
                    { leavingDate: null },
                    { leavingDate: { gte: startDate || undefined } },
                  ],
                  joiningDate: { lte: endDate || undefined },
                }
              : {},
          ],
        },
      };
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
  }

  async deleteEmployeeById(id: string): Promise<Employee> {
    const deleteEmployeeResponse = await this.prisma.employee.delete({
      where: { id },
    });
    return deleteEmployeeResponse;
  }
}
