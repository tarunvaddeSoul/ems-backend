import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EmployeeService } from './employee.service';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
@ApiTags('Employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'aadhaar', maxCount: 1 },
    ]),
  )
  async createEmployee(
    @Body() data: CreateEmployeeDto,
    @UploadedFiles()
    files: { photo?: Express.Multer.File[]; aadhaar?: Express.Multer.File[] },
  ) {
    return this.employeeService.createEmployee(
      data,
      files.photo[0],
      files.aadhaar[0],
    );
  }

  @Version('1')
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'aadhaar', maxCount: 1 },
    ]),
  )
  async updateEmployee(
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDto,
    @UploadedFiles()
    files: { photo?: Express.Multer.File[]; aadhaar?: Express.Multer.File[] },
  ) {
    console.log('inside controller', files.photo, files.aadhaar);
    return this.employeeService.updateEmployee(
      id,
      data,
      files.photo ? files.photo[0] : null,
      files.aadhaar ? files.aadhaar[0] : null,
    );
  }

  @Get(':id')
  async getEmployeeById(@Param('id') id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  @Get()
  async getAllEmployees() {
    return this.employeeService.getAllEmployees();
  }
}
