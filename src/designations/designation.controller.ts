import { Controller, Post, Get, Delete, Param, Body, UseInterceptors } from '@nestjs/common';
import { DesignationService } from './designation.service';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/transform-interceptor';

@ApiTags('Designations')
@Controller('designation')
@UseInterceptors(TransformInterceptor)
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @Post()
  async create(@Body('name') name: string) {
    return this.designationService.createDesignation(name);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.designationService.getDesignationById(id);
  }

  @Get('name/:name')
  async getByName(@Param('name') name: string) {
    return this.designationService.getDesignationByName(name);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return this.designationService.deleteDesignationById(id);
  }

  @Delete('name/:name')
  async deleteByName(@Param('name') name: string) {
    return this.designationService.deleteDesignationByName(name);
  }

  @Get()
  async getAll() {
    return this.designationService.getAll();
  }
}
