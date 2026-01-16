import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SalaryRateScheduleRepository } from './salary-rate-schedule.repository';
import { CreateSalaryRateScheduleDto } from './dto/create-salary-rate-schedule.dto';
import { UpdateSalaryRateScheduleDto } from './dto/update-salary-rate-schedule.dto';
import { GetSalaryRateScheduleDto } from './dto/get-salary-rate-schedule.dto';
import { IResponse } from 'src/types/response.interface';
import {
  SalaryRateSchedule,
  SalaryCategory,
  SalarySubCategory,
} from '@prisma/client';

@Injectable()
export class SalaryRateScheduleService {
  private readonly logger = new Logger(SalaryRateScheduleService.name);

  constructor(
    private readonly salaryRateScheduleRepository: SalaryRateScheduleRepository,
  ) {}

  async create(
    createDto: CreateSalaryRateScheduleDto,
  ): Promise<IResponse<SalaryRateSchedule>> {
    try {
      // Validate effective dates
      const effectiveFrom = new Date(createDto.effectiveFrom);
      const effectiveTo = createDto.effectiveTo
        ? new Date(createDto.effectiveTo)
        : null;

      if (effectiveTo && effectiveTo <= effectiveFrom) {
        throw new BadRequestException(
          'effectiveTo must be after effectiveFrom',
        );
      }

      // Validate rate is positive
      if (createDto.ratePerDay <= 0) {
        throw new BadRequestException('ratePerDay must be greater than 0');
      }

      // Use transaction to ensure atomicity of update + create operations
      // This prevents race conditions and ensures data consistency
      const rateSchedule =
        await this.salaryRateScheduleRepository.createWithAutoClose({
          category: createDto.category,
          subCategory: createDto.subCategory,
          ratePerDay: createDto.ratePerDay,
          effectiveFrom: effectiveFrom,
          effectiveTo: effectiveTo || undefined,
          isActive: createDto.isActive ?? true,
        });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Salary rate schedule created successfully',
        data: rateSchedule,
      };
    } catch (error) {
      // Re-throw known exceptions with their original context
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Log unexpected errors with full context
      this.logger.error(
        `Failed to create salary rate schedule: ${error.message}`,
        error.stack,
        {
          category: createDto.category,
          subCategory: createDto.subCategory,
          effectiveFrom: createDto.effectiveFrom,
          effectiveTo: createDto.effectiveTo,
        },
      );
      throw new BadRequestException(
        `Failed to create salary rate schedule: ${error.message}`,
      );
    }
  }

  async findAll(queryDto: GetSalaryRateScheduleDto): Promise<
    IResponse<{
      data: SalaryRateSchedule[];
      total: number;
      page: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }>
  > {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.salaryRateScheduleRepository.findAll({
          category: queryDto.category,
          subCategory: queryDto.subCategory,
          isActive: queryDto.isActive,
          skip,
          take: limit,
        }),
        this.salaryRateScheduleRepository.count({
          category: queryDto.category,
          subCategory: queryDto.subCategory,
          isActive: queryDto.isActive,
        }),
      ]);

      return {
        statusCode: HttpStatus.OK,
        message: 'Salary rate schedules retrieved successfully',
        data: {
          data,
          total,
          page,
          limit,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve salary rate schedules: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve salary rate schedules');
    }
  }

  async findById(id: string): Promise<IResponse<SalaryRateSchedule>> {
    try {
      const rateSchedule = await this.salaryRateScheduleRepository.findById(id);

      if (!rateSchedule) {
        throw new NotFoundException(
          `Salary rate schedule with ID ${id} not found`,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Salary rate schedule retrieved successfully',
        data: rateSchedule,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to retrieve salary rate schedule: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve salary rate schedule');
    }
  }

  async update(
    id: string,
    updateDto: UpdateSalaryRateScheduleDto,
  ): Promise<IResponse<SalaryRateSchedule>> {
    try {
      // Check if rate schedule exists
      const existing = await this.salaryRateScheduleRepository.findById(id);

      if (!existing) {
        throw new NotFoundException(
          `Salary rate schedule with ID ${id} not found`,
        );
      }

      // Validate effective dates if provided
      let effectiveFrom = existing.effectiveFrom;
      let effectiveTo = existing.effectiveTo;

      if (updateDto.effectiveFrom) {
        effectiveFrom = new Date(updateDto.effectiveFrom);
      }

      if (updateDto.effectiveTo !== undefined) {
        effectiveTo = updateDto.effectiveTo
          ? new Date(updateDto.effectiveTo)
          : null;
      }

      if (effectiveTo && effectiveTo <= effectiveFrom) {
        throw new BadRequestException(
          'effectiveTo must be after effectiveFrom',
        );
      }

      // Check for overlapping active rates (excluding current record)
      if (
        updateDto.effectiveFrom ||
        updateDto.effectiveTo !== undefined ||
        updateDto.isActive === true
      ) {
        const hasOverlap =
          await this.salaryRateScheduleRepository.hasOverlappingActiveRate(
            existing.category,
            existing.subCategory,
            effectiveFrom,
            effectiveTo,
            id, // Exclude current record
          );

        if (hasOverlap) {
          throw new ConflictException(
            `An active rate schedule already exists for ${existing.category} - ${existing.subCategory} that overlaps with the specified date range`,
          );
        }
      }

      // Update the rate schedule
      const updateData: {
        ratePerDay?: number;
        effectiveFrom?: Date;
        effectiveTo?: Date | null;
        isActive?: boolean;
      } = {};
      if (updateDto.ratePerDay !== undefined) {
        updateData.ratePerDay = updateDto.ratePerDay;
      }
      if (updateDto.effectiveFrom) {
        updateData.effectiveFrom = effectiveFrom;
      }
      if (updateDto.effectiveTo !== undefined) {
        updateData.effectiveTo = effectiveTo || undefined;
      }
      if (updateDto.isActive !== undefined) {
        updateData.isActive = updateDto.isActive;
      }

      const updated = await this.salaryRateScheduleRepository.update(
        id,
        updateData,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Salary rate schedule updated successfully',
        data: updated,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update salary rate schedule: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Failed to update salary rate schedule. Please check your input.',
      );
    }
  }

  async delete(id: string): Promise<IResponse<SalaryRateSchedule>> {
    try {
      const existing = await this.salaryRateScheduleRepository.findById(id);

      if (!existing) {
        throw new NotFoundException(
          `Salary rate schedule with ID ${id} not found`,
        );
      }

      const deleted = await this.salaryRateScheduleRepository.delete(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Salary rate schedule deleted successfully',
        data: deleted,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to delete salary rate schedule: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to delete salary rate schedule');
    }
  }

  /**
   * Get active rate for a given category, subcategory, and date
   * Returns the rate that was/is effective on the given date (even if rate is now closed)
   */
  async getActiveRate(
    category: SalaryCategory,
    subCategory: SalarySubCategory,
    date: Date = new Date(),
  ): Promise<SalaryRateSchedule | null> {
    return this.salaryRateScheduleRepository.findActiveRate(
      category,
      subCategory,
      date,
    );
  }

  /**
   * Get rate schedule that was effective on a specific date
   * This works for both active and inactive rates (historical lookup)
   */
  async getRateForDate(
    category: SalaryCategory,
    subCategory: SalarySubCategory,
    date: Date,
  ): Promise<SalaryRateSchedule | null> {
    // Query for rate that was effective on this date, regardless of isActive status
    return this.salaryRateScheduleRepository.findRateForDate(
      category,
      subCategory,
      date,
    );
  }

  /**
   * Get all active rates for a category and subcategory
   */
  async getActiveRatesByCategory(
    category: SalaryCategory,
    subCategory: SalarySubCategory,
  ): Promise<IResponse<SalaryRateSchedule[]>> {
    try {
      const rates =
        await this.salaryRateScheduleRepository.findActiveRatesByCategory(
          category,
          subCategory,
        );

      return {
        statusCode: HttpStatus.OK,
        message: 'Active salary rate schedules retrieved successfully',
        data: rates,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve active rates: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Failed to retrieve active salary rate schedules',
      );
    }
  }
}
