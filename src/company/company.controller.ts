import { Controller, Post, Put, Get, Param, Body } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@Controller('companies')
@ApiTags('Companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'The company has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createCompany(@Body() data: CreateCompanyDto) {
    return this.companyService.createCompany(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiResponse({
    status: 200,
    description: 'The company has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async updateCompany(@Param('id') id: string, @Body() data: UpdateCompanyDto) {
    return this.companyService.updateCompany(id, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by id' })
  @ApiResponse({ status: 200, description: 'The company data.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async getCompanyById(@Param('id') id: string) {
    return this.companyService.getCompanyById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'The list of companies.' })
  async getAllCompanies() {
    return this.companyService.getAllCompanies();
  }
}
