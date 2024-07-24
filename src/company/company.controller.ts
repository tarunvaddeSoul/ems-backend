import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  Delete,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Version,
  Query,
} from '@nestjs/common';
import { CompanyService } from './company.service';
// import { CreateCompanyDto } from './dto/create-company.dto';
// import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { DeleteCompaniesDto } from './dto/delete-companies.dto';
import { GetAllCompaniesDto } from './dto/get-all-companies.dto';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Controller('companies')
@UseInterceptors(TransformInterceptor)
@ApiTags('Companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @HttpCode(HttpStatus.CREATED)
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

  @Get('employee-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get employees count',
    description: 'Get employees count by company',
  })
  async getCompanyWithEmployeeCount() {
    return await this.companyService.getCompanyWithEmployeeCount();
  }
  
  @HttpCode(HttpStatus.OK)
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

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Get a company by id' })
  @ApiResponse({ status: 200, description: 'The company data.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async getCompanyById(@Param('id') id: string) {
    return this.companyService.getCompanyById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({
    summary: 'Get all companies',
    description:
      'Retrieves a list of companies with pagination, filtering, and sorting.',
  })
  @ApiResponse({ status: 200, description: 'The list of companies.' })
  async getAllCompanies(@Query() queryParams: GetAllCompaniesDto) {
    return this.companyService.getAllCompanies(queryParams);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async deleteCompany(
    @Param('id') id: string,
  ): Promise<{ message: string; data: any }> {
    return this.companyService.deleteCompany(id);
  }

  @Version('1')
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Multiple Employees',
    description: 'Delete multiple employees by their IDs',
  })
  async deleteMultipleEmployees(
    @Body() deleteCompaniesDto: DeleteCompaniesDto,
  ) {
    return this.companyService.deleteMultipleCompanies(deleteCompaniesDto.ids);
  }

}
