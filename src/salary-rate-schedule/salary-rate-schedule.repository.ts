import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SalaryRateSchedule,
  SalaryCategory,
  SalarySubCategory,
  Prisma,
} from '@prisma/client';

@Injectable()
export class SalaryRateScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    category: SalaryCategory;
    subCategory: SalarySubCategory;
    ratePerDay: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    isActive?: boolean;
  }): Promise<SalaryRateSchedule> {
    return this.prisma.salaryRateSchedule.create({
      data,
    });
  }

  async findById(id: string): Promise<SalaryRateSchedule | null> {
    return this.prisma.salaryRateSchedule.findUnique({
      where: { id },
    });
  }

  async findAll(params?: {
    category?: SalaryCategory;
    subCategory?: SalarySubCategory;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<SalaryRateSchedule[]> {
    const where: Prisma.SalaryRateScheduleWhereInput = {};

    if (params?.category) {
      where.category = params.category;
    }

    if (params?.subCategory) {
      where.subCategory = params.subCategory;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return this.prisma.salaryRateSchedule.findMany({
      where,
      skip: params?.skip,
      take: params?.take,
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async update(
    id: string,
    data: {
      ratePerDay?: number;
      effectiveFrom?: Date;
      effectiveTo?: Date;
      isActive?: boolean;
    },
  ): Promise<SalaryRateSchedule> {
    return this.prisma.salaryRateSchedule.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<SalaryRateSchedule> {
    return this.prisma.salaryRateSchedule.delete({
      where: { id },
    });
  }

  /**
   * Find active rate for a given category, subcategory, and date
   * Returns the rate that is effective on the given date
   */
  async findActiveRate(
    category: SalaryCategory,
    subCategory: SalarySubCategory,
    date: Date,
  ): Promise<SalaryRateSchedule | null> {
    return this.prisma.salaryRateSchedule.findFirst({
      where: {
        category,
        subCategory,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * Check for overlapping active rates
   * Returns true if there's an overlapping active rate
   */
  async hasOverlappingActiveRate(
    category: SalaryCategory,
    subCategory: SalarySubCategory,
    effectiveFrom: Date,
    effectiveTo: Date | null,
    excludeId?: string,
  ): Promise<boolean> {
    const where: Prisma.SalaryRateScheduleWhereInput = {
      category,
      subCategory,
      isActive: true,
      ...(excludeId && { id: { not: excludeId } }),
      OR: [
        // New rate starts before existing rate ends
        {
          AND: [
            { effectiveFrom: { lte: effectiveFrom } },
            {
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: effectiveFrom } },
              ],
            },
          ],
        },
        // New rate starts during existing rate
        {
          AND: [
            { effectiveFrom: { gte: effectiveFrom } },
            {
              OR: [
                { effectiveTo: null },
                {
                  AND: [
                    { effectiveTo: { gte: effectiveFrom } },
                    ...(effectiveTo
                      ? [{ effectiveTo: { lte: effectiveTo } }]
                      : []),
                  ],
                },
              ],
            },
          ],
        },
        // New rate ends during existing rate
        ...(effectiveTo
          ? [
              {
                AND: [
                  { effectiveFrom: { lte: effectiveTo } },
                  {
                    OR: [
                      { effectiveTo: null },
                      { effectiveTo: { gte: effectiveTo } },
                    ],
                  },
                ],
              },
            ]
          : []),
      ],
    };

    const count = await this.prisma.salaryRateSchedule.count({ where });
    return count > 0;
  }

  /**
   * Get all active rates for a category and subcategory
   */
  async findActiveRatesByCategory(
    category: SalaryCategory,
    subCategory: SalarySubCategory,
  ): Promise<SalaryRateSchedule[]> {
    return this.prisma.salaryRateSchedule.findMany({
      where: {
        category,
        subCategory,
        isActive: true,
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * Count total records
   */
  async count(params?: {
    category?: SalaryCategory;
    subCategory?: SalarySubCategory;
    isActive?: boolean;
  }): Promise<number> {
    const where: Prisma.SalaryRateScheduleWhereInput = {};

    if (params?.category) {
      where.category = params.category;
    }

    if (params?.subCategory) {
      where.subCategory = params.subCategory;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return this.prisma.salaryRateSchedule.count({ where });
  }
}

