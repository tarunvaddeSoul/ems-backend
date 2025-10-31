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
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { ApiResponseDto, ApiErrorResponseDto } from 'src/common/dto/api-response.dto';
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
  @ApiOperation({
    summary: 'Create a new company',
    description: 'Creates a new company with salary template configuration. Company name must be unique.',
  })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid data provided',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - Company with the same name already exists',
    type: ApiErrorResponseDto,
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
  @ApiOperation({
    summary: 'Update a company',
    description: 'Updates company details including name, address, contact info, and salary configuration options.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID (UUID)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
    type: String,
  })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
    type: ApiErrorResponseDto,
  })
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
    summary: 'Get employees count by company',
    description: 'Retrieves list of companies with their employee counts',
  })
  @ApiResponse({
    status: 200,
    description: 'Company employee counts retrieved successfully',
    type: ApiResponseDto,
  })
  async getCompanyWithEmployeeCount(@Res() res: Response): Promise<Response> {
    const response = await this.companyService.getCompanyWithEmployeeCount();
    return res.status(response.statusCode).json(response);
  }

  @Get(':companyId/employees')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get employees in a company',
    description: 'Retrieves all employees associated with a specific company',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID (UUID)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    type: ApiErrorResponseDto,
  })
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
  @ApiOperation({
    summary: 'Get a company by ID',
    description: 'Retrieves detailed information about a specific company including all configuration settings',
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID (UUID)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Company data retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    type: ApiErrorResponseDto,
  })
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
      'Retrieves a list of companies with pagination, filtering, and sorting. Supports query parameters for status, search, and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of companies retrieved successfully',
    type: ApiResponseDto,
  })
  async getAllCompanies(
    @Res() res: Response,
    @Query() queryParams: GetAllCompaniesDto,
  ): Promise<Response> {
    const response = await this.companyService.getAllCompanies(queryParams);
    return res.status(response.statusCode).json(response);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete company',
    description: 'Deletes a company by ID. Note: This may cascade delete related records.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID (UUID)',
    example: '3bbd6f5e-663b-4a00-b756-fcd2f4c08a79',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    type: ApiErrorResponseDto,
  })
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
