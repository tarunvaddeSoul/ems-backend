import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRepository } from './company.repository';
// import { CreateCompanyDto } from './dto/create-company.dto';
// import { UpdateCompanyDto } from './dto/update-company.dto';
import { GetAllCompaniesDto } from './dto/get-all-companies.dto';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly logger: Logger,
  ) {}
  

  async createCompany(data: CreateCompanyDto) {
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
        message: 'Company created successfully',
        data: createCompanyResponse,
      };
    } catch (error) {
      this.logger.error(`Error creating company`);
      throw error;
    }
  }

  async updateCompany(id: string, data: UpdateCompanyDto) {
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
        message: 'Company updated successfully',
        data: updateCompanyResponse,
      };
    } catch (error) {
      this.logger.error(`Error updating company`);
      throw error;
    }
  }

  async getCompanyById(id: string) {
    try {
      const company = await this.companyRepository.findById(id);
      if (!company) {
        throw new NotFoundException(`Company with id: ${id} does not exist.`);
      }
      return { message: 'Company fetched successfully', data: company };
    } catch (error) {
      this.logger.error(`Error fetching company data by id: ${id}`);
      throw error;
    }
  }

  async getAllCompanies(queryParams: GetAllCompaniesDto) {
    try {
      const companiesResponse = await this.companyRepository.findAll(
        queryParams,
      );
      if (companiesResponse.companies.length === 0) {
        throw new NotFoundException(`No companies found`);
      }
      return {
        message: 'Companies fetched successfully',
        data: companiesResponse,
      };
    } catch (error) {
      this.logger.error(`Error fetching companies' data`);
      throw error;
    }
  }

  async deleteCompany(id: string) {
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
        message: 'Company deleted successfully',
        data: deleteCompanyResponse,
      };
    } catch (error) {
      this.logger.error(`Error deleting company by id: ${id}`);
      throw error;
    }
  }

  async deleteMultipleCompanies(ids: string[]): Promise<{ message: string }> {
    try {
      for (const id of ids) {
        const company = await this.companyRepository.findById(id);
        if (!company) {
          throw new NotFoundException(`Company with ID ${id} not found`);
        }
        await this.companyRepository.deleteCompany(id);
      }
      return { message: 'Companies deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting companies`);
      throw error;
    }
  }

  async getCompanyWithEmployeeCount() {
    try {
      const companyData =
        await this.companyRepository.getCompanyWithEmployeeCount();
      return {
        message: 'Company data fetched successfully',
        data: companyData,
      };
    } catch (error) {
      this.logger.error(`Error deleting companies`);
      throw error;
    }
  }
}
