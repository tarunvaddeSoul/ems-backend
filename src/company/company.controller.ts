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
  Res,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { DeleteCompaniesDto } from './dto/delete-companies.dto';
import { GetAllCompaniesDto } from './dto/get-all-companies.dto';
import { UpdateCompanyDto } from './dto/company.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { GetEmployeesResponseDto } from './dto/get-employees-response.dto';
import { Response } from 'express';

@Controller('companies')
@UseInterceptors(TransformInterceptor)
@ApiTags('Companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  // @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create a new company',
    description: 'Creates a new company with salary template configuration',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The company has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request: Invalid data provided.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict: Company with the same name already exists.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized: User is not authenticated.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden: User does not have permission.',
  })
  async createCompany(
    @Res() res: Response,
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<Response> {
    // this.logger.log(`Request to create company: ${createCompanyDto.name}`);
    const response = await this.companyService.createCompany(createCompanyDto);
    return res.status(response.statusCode).json(response);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiResponse({
    status: 200,
    description: 'The company has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async updateCompany(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() data: UpdateCompanyDto,
  ): Promise<Response> {
    const response = await this.companyService.updateCompany(id, data);
    return res.status(response.statusCode).json(response);
  }

  @Get('employee-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get employees count',
    description: 'Get employees count by company',
  })
  async getCompanyWithEmployeeCount(@Res() res: Response): Promise<Response> {
    const response = await this.companyService.getCompanyWithEmployeeCount();
    return res.status(response.statusCode).json(response);
  }

  @Get(':companyId/employees')
  @ApiResponse({ status: 200, type: [GetEmployeesResponseDto] })
  async getEmployeesInACompany(
    @Res() res: Response,
    @Param('companyId') companyId: string,
  ): Promise<Response> {
    const response = await this.companyService.getEmployeesInACompany(
      companyId,
    );
    return res.status(response.statusCode).json(response);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Get a company by id' })
  @ApiResponse({ status: 200, description: 'The company data.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async getCompanyById(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<Response> {
    const response = await this.companyService.getCompanyById(id);
    return res.status(response.statusCode).json(response);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({
    summary: 'Get all companies',
    description:
      'Retrieves a list of companies with pagination, filtering, and sorting.',
  })
  @ApiResponse({ status: 200, description: 'The list of companies.' })
  async getAllCompanies(
    @Res() res: Response,
    @Query() queryParams: GetAllCompaniesDto,
  ): Promise<Response> {
    const response = await this.companyService.getAllCompanies(queryParams);
    return res.status(response.statusCode).json(response);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async deleteCompany(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<Response> {
    const response = await this.companyService.deleteCompany(id);
    return res.status(response.statusCode).json(response);
  }

  @Version('1')
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Multiple Employees',
    description: 'Delete multiple employees by their IDs',
  })
  async deleteMultipleEmployees(
    @Res() res: Response,
    @Body() deleteCompaniesDto: DeleteCompaniesDto,
  ): Promise<Response> {
    const response = await this.companyService.deleteMultipleCompanies(
      deleteCompaniesDto.ids,
    );
    return res.status(response.statusCode).json(response);
  }
}
