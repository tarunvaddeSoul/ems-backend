import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DesignationRepository } from './designation.repository';

@Injectable()
export class DesignationService {
  constructor(private readonly designationRepository: DesignationRepository) {}

  async createDesignation(name: string) {
    try {
      const designation = await this.designationRepository.getByName(name);
      if (designation) {
        throw new ConflictException(
          `Designation with name: ${name} already exists.`,
        );
      }
      const createResponse = await this.designationRepository.create(name);
      return {
        message: 'Designation created successfully!',
        data: createResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async getDesignationById(id: string) {
    try {
      const designation = await this.designationRepository.getById(id);
      if (!designation) {
        throw new NotFoundException(
          `Designation with ID: ${id} does not exist.`,
        );
      }
      return {
        message: 'Designation created successfully!',
        data: designation,
      };
    } catch (error) {
      throw error;
    }
  }

  async getDesignationByName(name: string) {
    try {
      const designation = await this.designationRepository.getByName(name);
      if (!designation) {
        throw new NotFoundException(
          `Designation with name: ${name} does not exist.`,
        );
      }
      return {
        message: 'Designation created successfully!',
        data: designation,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteDesignationById(id: string) {
    try {
      const designation = await this.designationRepository.getById(id);
      if (!designation) {
        throw new NotFoundException(
          `Designation with ID: ${id} does not exist.`,
        );
      }
      const deleteResponse = await this.designationRepository.deleteById(id);
      return {
        message: 'Designation deleted successfully.',
        data: deleteResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteDesignationByName(name: string) {
    try {
      const designation = await this.designationRepository.getByName(name);
      if (!designation) {
        throw new NotFoundException(
          `Designation with name: ${name} does not exist.`,
        );
      }
      const deleteResponse = await this.designationRepository.deleteByName(
        name,
      );
      return {
        message: 'Designation deleted successfully.',
        data: deleteResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
        const designations = await this.designationRepository.getAll();
        if (designations.length === 0) {
            throw new NotFoundException(`Designations not found.`);
        }
        return { message: 'Designations fetched successfully', data: designations };
    } catch (error) {
        throw error;
    }
  }
}
