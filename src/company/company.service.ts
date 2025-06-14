import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { GetAllCompaniesDto } from './dto/get-all-companies.dto';
import { UpdateCompanyDto } from './dto/company.dto';
import { Company } from '@prisma/client';
import { IResponse } from 'src/types/response.interface';
import { GetEmployeesResponseDto } from './dto/get-employees-response.dto';
import {
  CreateCompanyDto,
  SalaryTemplateFieldDto,
} from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly logger: Logger,
  ) {}

  async createCompany(
    createCompanyDto: CreateCompanyDto,
  ): Promise<IResponse<Company>> {
    try {
      // Validate company data doesn't already exist
      await this.validateCompanyData(createCompanyDto);

      // Validate the salary template configuration
      this.validateSalaryTemplateConfig(createCompanyDto.salaryTemplates);

      // Create company with validated data
      const createdCompany = await this.companyRepository.create(
        createCompanyDto,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Company created successfully',
        data: createdCompany,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to create company: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to create company due to an unexpected error',
      );
    }
  }

  private async validateCompanyData(
    createCompanyDto: CreateCompanyDto,
  ): Promise<void> {
    // Check if company already exists
    const companyExists = await this.companyRepository.findByName(
      createCompanyDto.name,
    );
    if (companyExists) {
      throw new ConflictException(
        `Company with name: ${createCompanyDto.name} already exists.`,
      );
    }
    // Check if phone number is already in use
    // const phoneExists = await this.companyRepository.findByContactNumber(
    //   createCompanyDto.contactPersonNumber,
    // );
    // if (phoneExists) {
    //   throw new ConflictException(
    //     `Contact number ${createCompanyDto.contactPersonNumber} is already associated with another company.`,
    //   );
    // }
  }

  private validateSalaryTemplateConfig(salaryTemplateConfig: any): void {
    const { mandatoryFields, optionalFields, customFields } =
      salaryTemplateConfig;

    // Validate mandatory fields requirements
    this.validateMandatoryFields(mandatoryFields);

    // Validate "basic duty" is configured properly if present
    this.validateBasicDutyField([
      ...mandatoryFields,
      ...optionalFields,
      ...(customFields || []),
    ]);

    // Validate custom fields if present
    if (customFields && customFields.length > 0) {
      this.validateCustomFields(customFields);
    }
  }

  private validateMandatoryFields(
    mandatoryFields: SalaryTemplateFieldDto[],
  ): void {
    // Check that all required mandatory fields are present and enabled
    const requiredKeys = [
      'serialNumber',
      'companyName',
      'employeeName',
      'designation',
      'monthlyPay',
      'grossSalary',
      'totalDeduction',
      'netSalary',
    ];

    const mandatoryFieldKeys = mandatoryFields
      .filter((field) => field.enabled)
      .map((field) => field.key);

    const missingFields = requiredKeys.filter(
      (key) => !mandatoryFieldKeys.includes(key),
    );

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Following mandatory fields must be enabled: ${missingFields.join(
          ', ',
        )}`,
      );
    }
  }

  private validateBasicDutyField(allFields: SalaryTemplateFieldDto[]): void {
    const basicDutyField = allFields.find((field) => field.key === 'basicDuty');

    if (basicDutyField && basicDutyField.enabled) {
      // Ensure basic duty has proper rules
      if (
        !basicDutyField.rules ||
        Number(basicDutyField.rules.defaultValue) < 26 ||
        Number(basicDutyField.rules.defaultValue) > 31
      ) {
        throw new BadRequestException(
          'Basic duty field must have rules with minValue >= 26 and maxValue <= 31',
        );
      }
    }
  }

  private validateCustomFields(customFields: SalaryTemplateFieldDto[]): void {
    // Ensure all custom fields have unique keys
    const customFieldKeys = customFields.map((field) => field.key);
    if (new Set(customFieldKeys).size !== customFieldKeys.length) {
      throw new BadRequestException('Custom fields must have unique keys');
    }

    // Validate each custom field has proper configuration
    customFields.forEach((field) => {
      if (!field.key || !field.label || !field.type) {
        throw new BadRequestException(
          `Custom field ${
            field.key || 'unnamed'
          } is missing required properties (key, label, type)`,
        );
      }
    });
  }

  async updateCompany(
    id: string,
    data: UpdateCompanyDto,
  ): Promise<IResponse<Company>> {
    try {
      // Optionally validate company exists
      const company = await this.companyRepository.findById(id);
      if (!company) {
        throw new NotFoundException(`Company with id: ${id} does not exist.`);
      }

      // Optionally validate salary template config if present
      if (data.salaryTemplates) {
        this.validateSalaryTemplateConfig(data.salaryTemplates);
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
