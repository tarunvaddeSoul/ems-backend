import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async createCompany(data: CreateCompanyDto) {
    try {
      return await this.companyRepository.create(data);
    } catch (error) {
      throw new Error('Failed to create company');
    }
  }

  async updateCompany(id: string, data: UpdateCompanyDto) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundException(`Company with id: ${id} does not exist.`);
    }
    return this.companyRepository.update(id, data);
  }

  async getCompanyById(id: string) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundException(`Company with id: ${id} does not exist.`);
    }
    return company;
  }

  async getAllCompanies() {
    return this.companyRepository.findAll();
  }
}
