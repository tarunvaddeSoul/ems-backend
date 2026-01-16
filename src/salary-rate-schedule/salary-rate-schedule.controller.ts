import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { Response } from 'express';
import { SalaryRateScheduleService } from './salary-rate-schedule.service';
import { CreateSalaryRateScheduleDto } from './dto/create-salary-rate-schedule.dto';
import { UpdateSalaryRateScheduleDto } from './dto/update-salary-rate-schedule.dto';
import { GetSalaryRateScheduleDto } from './dto/get-salary-rate-schedule.dto';

@ApiTags('Salary Rate Schedule')
@Controller('salary-rate-schedule')
@UseInterceptors(TransformInterceptor)
export class SalaryRateScheduleController {
  constructor(
    private readonly salaryRateScheduleService: SalaryRateScheduleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new salary rate schedule' })
  @ApiResponse({
    status: 201,
    description: 'The salary rate schedule has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Overlapping rate exists.',
  })
  async create(
    @Body() createDto: CreateSalaryRateScheduleDto,
    @Res() res: Response,
  ) {
    const result = await this.salaryRateScheduleService.create(createDto);
    return res.status(result.statusCode).json(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all salary rate schedules with filters' })
  @ApiResponse({
    status: 200,
    description: 'List of salary rate schedules retrieved successfully.',
  })
  async findAll(
    @Query() queryDto: GetSalaryRateScheduleDto,
    @Res() res: Response,
  ) {
    const result = await this.salaryRateScheduleService.findAll(queryDto);
    return res.status(result.statusCode).json(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salary rate schedule by ID' })
  @ApiParam({ name: 'id', description: 'Salary rate schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Salary rate schedule retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Salary rate schedule not found.' })
  async findById(@Param('id') id: string, @Res() res: Response) {
    const result = await this.salaryRateScheduleService.findById(id);
    return res.status(result.statusCode).json(result);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update salary rate schedule' })
  @ApiParam({ name: 'id', description: 'Salary rate schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Salary rate schedule updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Salary rate schedule not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Overlapping rate exists.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSalaryRateScheduleDto,
    @Res() res: Response,
  ) {
    const result = await this.salaryRateScheduleService.update(id, updateDto);
    return res.status(result.statusCode).json(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete salary rate schedule' })
  @ApiParam({ name: 'id', description: 'Salary rate schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Salary rate schedule deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Salary rate schedule not found.' })
  async delete(@Param('id') id: string, @Res() res: Response) {
    const result = await this.salaryRateScheduleService.delete(id);
    return res.status(result.statusCode).json(result);
  }

  @Get('active/:category/:subCategory')
  @ApiOperation({
    summary:
      'Get all active salary rate schedules for a category and subcategory',
  })
  @ApiParam({
    name: 'category',
    description: 'Salary category (CENTRAL, STATE, SPECIALIZED)',
  })
  @ApiParam({
    name: 'subCategory',
    description:
      'Salary sub-category (SKILLED, UNSKILLED, HIGHSKILLED, SEMISKILLED)',
  })
  @ApiResponse({
    status: 200,
    description: 'Active salary rate schedules retrieved successfully.',
  })
  async getActiveRatesByCategory(
    @Param('category') category: string,
    @Param('subCategory') subCategory: string,
    @Res() res: Response,
  ) {
    // Eager validation of category and subCategory enums
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SalaryCategory, SalarySubCategory } = require('@prisma/client');

    if (!Object.values(SalaryCategory).includes(category)) {
      return res.status(400).json({
        statusCode: 400,
        message: `Invalid category. Allowed values: ${Object.values(
          SalaryCategory,
        ).join(', ')}`,
      });
    }

    if (!Object.values(SalarySubCategory).includes(subCategory)) {
      return res.status(400).json({
        statusCode: 400,
        message: `Invalid subCategory. Allowed values: ${Object.values(
          SalarySubCategory,
        ).join(', ')}`,
      });
    }

    const result =
      await this.salaryRateScheduleService.getActiveRatesByCategory(
        category as typeof SalaryCategory,
        subCategory as typeof SalarySubCategory,
      );
    return res.status(result.statusCode).json(result);
  }

  @Get('rate-for-date/:category/:subCategory')
  @ApiOperation({
    summary:
      'Get rate schedule that was effective on a specific date (includes historical rates)',
  })
  @ApiParam({
    name: 'category',
    description: 'Salary category (CENTRAL, STATE)',
  })
  @ApiParam({
    name: 'subCategory',
    description:
      'Salary sub-category (SKILLED, UNSKILLED, HIGHSKILLED, SEMISKILLED)',
  })
  @ApiQuery({
    name: 'date',
    description: 'Date to check (ISO 8601 format, e.g., 2024-04-15)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Rate schedule for the specified date retrieved successfully.',
  })
  async getRateForDate(
    @Param('category') category: string,
    @Param('subCategory') subCategory: string,
    @Query('date') dateString: string,
    @Res() res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SalaryCategory, SalarySubCategory } = require('@prisma/client');

    if (!Object.values(SalaryCategory).includes(category)) {
      return res.status(400).json({
        statusCode: 400,
        message: `Invalid category. Allowed values: ${Object.values(
          SalaryCategory,
        ).join(', ')}`,
      });
    }

    if (!Object.values(SalarySubCategory).includes(subCategory)) {
      return res.status(400).json({
        statusCode: 400,
        message: `Invalid subCategory. Allowed values: ${Object.values(
          SalarySubCategory,
        ).join(', ')}`,
      });
    }

    if (!dateString) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Date parameter is required',
      });
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          statusCode: 400,
          message:
            'Invalid date format. Use ISO 8601 format (e.g., 2024-04-15)',
        });
      }

      const rate = await this.salaryRateScheduleService.getRateForDate(
        category as typeof SalaryCategory,
        subCategory as typeof SalarySubCategory,
        date,
      );

      if (!rate) {
        return res.status(404).json({
          statusCode: 404,
          message: `No rate schedule found for ${category} - ${subCategory} on ${dateString}`,
          data: null,
        });
      }

      return res.status(200).json({
        statusCode: 200,
        message: 'Rate schedule retrieved successfully',
        data: rate,
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: `Failed to retrieve rate schedule: ${error.message}`,
      });
    }
  }
}
