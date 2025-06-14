import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { DesignationService } from './designation.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';
import { Response } from 'express';
import { CreateDesignationDto } from './dto/create-designation.dto';

@ApiTags('Designations')
@Controller('designations')
@UseInterceptors(TransformInterceptor)
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new designation' })
  @ApiBody({ type: CreateDesignationDto })
  @ApiResponse({
    status: 201,
    description: 'The designation has been successfully created.',
    schema: {
      example: {
        statusCode: 201,
        message: 'Designation created successfully',
        data: {
          id: 'uuid',
          name: 'Senior Software Engineer',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createDesignationDto: CreateDesignationDto,
    @Res() res: Response,
  ) {
    const designation = await this.designationService.createDesignation(
      createDesignationDto.name,
    );
    return res.status(designation.statusCode).json(designation);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get designation by ID' })
  @ApiParam({ name: 'id', description: 'Designation ID' })
  @ApiResponse({
    status: 200,
    description: 'The designation has been successfully retrieved.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Designation retrieved successfully',
        data: {
          id: 'uuid',
          name: 'Senior Software Engineer',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Designation not found.' })
  async getById(@Param('id') id: string, @Res() res: Response) {
    const designation = await this.designationService.getDesignationById(id);
    return res.status(designation.statusCode).json(designation);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get designation by name' })
  @ApiParam({ name: 'name', description: 'Designation name' })
  @ApiResponse({
    status: 200,
    description: 'The designation has been successfully retrieved.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Designation retrieved successfully',
        data: {
          id: 'uuid',
          name: 'Senior Software Engineer',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Designation not found.' })
  async getByName(@Param('name') name: string, @Res() res: Response) {
    const designation = await this.designationService.getDesignationByName(
      name,
    );
    return res.status(designation.statusCode).json(designation);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete designation by ID' })
  @ApiParam({ name: 'id', description: 'Designation ID' })
  @ApiResponse({
    status: 200,
    description: 'The designation has been successfully deleted.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Designation deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Designation not found.' })
  async deleteById(@Param('id') id: string, @Res() res: Response) {
    const designation = await this.designationService.deleteDesignationById(id);
    return res.status(designation.statusCode).json(designation);
  }

  @Delete('name/:name')
  @ApiOperation({ summary: 'Delete designation by name' })
  @ApiParam({ name: 'name', description: 'Designation name' })
  @ApiResponse({
    status: 200,
    description: 'The designation has been successfully deleted.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Designation deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Designation not found.' })
  async deleteByName(@Param('name') name: string, @Res() res: Response) {
    const designation = await this.designationService.deleteDesignationByName(
      name,
    );
    return res.status(designation.statusCode).json(designation);
  }

  @Get()
  @ApiOperation({ summary: 'Get all designations' })
  @ApiResponse({
    status: 200,
    description: 'List of all designations has been successfully retrieved.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Designations retrieved successfully',
        data: [
          {
            id: 'uuid1',
            name: 'Senior Software Engineer',
          },
          {
            id: 'uuid2',
            name: 'Product Manager',
          },
        ],
      },
    },
  })
  async getAll(@Res() res: Response) {
    const designations = await this.designationService.getAll();
    return res.status(designations.statusCode).json(designations);
  }
}
