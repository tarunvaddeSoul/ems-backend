import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { GetAllCompaniesDto } from './dto/get-all-companies.dto';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { Company } from '@prisma/client';
import { IResponse } from 'src/types/response.interface';
import { GetEmployeesResponseDto } from './dto/get-employees-response.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly logger: Logger,
  ) {}

  async createCompany(data: CreateCompanyDto): Promise<IResponse<Company>> {
    try {
      const companyExists = await this.companyRepository.companyExists(
        data.name,
      );
      if (companyExists) {
        throw new ConflictException(
          `Company with name: ${data.name} already exists.`,
        );
      }
      const createCompanyResponse = await this.companyRepository.create(data);
      if (!createCompanyResponse) {
        throw new BadRequestException(`Error creating company`);
      }
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Company created successfully',
        data: createCompanyResponse,
      };
    } catch (error) {
      this.logger.error(`Error creating company`);
      throw error;
    }
  }

  async updateCompany(
    id: string,
    data: UpdateCompanyDto,
  ): Promise<IResponse<Company>> {
    try {
      const company = await this.companyRepository.findById(id);
      if (!company) {
        throw new NotFoundException(`Company with id: ${id} does not exist.`);
      }
      const updateCompanyResponse = await this.companyRepository.update(
        id,
        data,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Company updated successfully',
        data: updateCompanyResponse,
      };
    } catch (error) {
      this.logger.error(`Error updating company`);
      throw error;
    }
  }

  async getEmployeesInACompany(
    companyId: string,
  ): Promise<IResponse<GetEmployeesResponseDto[]>> {
    try {
      const company = await this.companyRepository.findById(companyId);
      if (!company) {
        throw new NotFoundException(
          `Company with id: ${companyId} does not exist.`,
        );
      }
      const getEmployeesInACompanyResponse =
        await this.companyRepository.getEmployeesInACompany(companyId);
      if (getEmployeesInACompanyResponse.length === 0) {
        throw new NotFoundException(`No employee records found.`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Employees retrieved successfully',
        data: getEmployeesInACompanyResponse,
      };
    } catch (error) {
      this.logger.error(`Error retrieving employees`);
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<IResponse<any>> {
    try {
      const company = await this.companyRepository.findById(id);
      if (!company) {
        throw new NotFoundException(`Company with id: ${id} does not exist.`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Company fetched successfully',
        data: company,
      };
    } catch (error) {
      this.logger.error(`Error fetching company data by id: ${id}`);
      throw error;
    }
  }

  async getAllCompanies(queryParams: GetAllCompaniesDto): Promise<
    IResponse<{
      companies: Company[];
      total: number;
    }>
  > {
    try {
      const companiesResponse = await this.companyRepository.findAll(
        queryParams,
      );
      if (companiesResponse.companies.length === 0) {
        throw new NotFoundException(`No companies found`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Companies fetched successfully',
        data: companiesResponse,
      };
    } catch (error) {
      this.logger.error(`Error fetching companies' data`);
      throw error;
    }
  }

  async deleteCompany(id: string): Promise<IResponse<Company>> {
    try {
      const company = await this.companyRepository.findById(id);
      if (!company) {
        throw new NotFoundException(`Company with id: ${id} does not exist.`);
      }
      const deleteCompanyResponse = await this.companyRepository.deleteCompany(
        id,
      );
      if (!deleteCompanyResponse) {
        throw new BadRequestException(`Error deleting company by id: ${id}`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Company deleted successfully',
        data: deleteCompanyResponse,
      };
    } catch (error) {
      this.logger.error(`Error deleting company by id: ${id}`);
      throw error;
    }
  }

  async deleteMultipleCompanies(ids: string[]): Promise<IResponse<null>> {
    try {
      for (const id of ids) {
        const company = await this.companyRepository.findById(id);
        if (!company) {
          throw new NotFoundException(`Company with ID ${id} not found`);
        }
        await this.companyRepository.deleteCompany(id);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Companies deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting companies`);
      throw error;
    }
  }

  async getCompanyWithEmployeeCount(): Promise<
    IResponse<
      {
        name: string;
        employeeCount: number;
      }[]
    >
  > {
    try {
      const companyData =
        await this.companyRepository.getCompanyWithEmployeeCount();
      return {
        statusCode: HttpStatus.OK,
        message: 'Company data fetched successfully',
        data: companyData,
      };
    } catch (error) {
      this.logger.error(`Error deleting companies`);
      throw error;
    }
  }
}
