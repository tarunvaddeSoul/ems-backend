import { Injectable, ConflictException } from '@nestjs/common';
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
   * Find rate that was effective on a specific date (including inactive/historical rates)
   * This is useful for historical lookups regardless of current active status
   */
  async findRateForDate(
    category: SalaryCategory,
    subCategory: SalarySubCategory,
    date: Date,
  ): Promise<SalaryRateSchedule | null> {
    return this.prisma.salaryRateSchedule.findFirst({
      where: {
        category,
        subCategory,
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

  /**
   * Create a new rate schedule with automatic closure of previous ongoing rates
   * Uses a transaction to ensure atomicity and prevent race conditions
   */
  async createWithAutoClose(data: {
    category: SalaryCategory;
    subCategory: SalarySubCategory;
    ratePerDay: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    isActive?: boolean;
  }): Promise<SalaryRateSchedule> {
    return this.prisma.$transaction(async (prisma) => {
      // Check for overlapping active rates within the transaction
      const hasOverlap = await this.hasOverlappingActiveRateInTransaction(
        prisma,
        data.category,
        data.subCategory,
        data.effectiveFrom,
        data.effectiveTo,
      );

      if (hasOverlap) {
        // Find ongoing rate (effectiveTo = null) that starts before new rate
        const existingRates = await prisma.salaryRateSchedule.findMany({
          where: {
            category: data.category,
            subCategory: data.subCategory,
            isActive: true,
          },
          orderBy: { effectiveFrom: 'desc' },
        });

        const ongoingRate = existingRates.find(
          (rate) =>
            rate.effectiveTo === null && rate.effectiveFrom < data.effectiveFrom,
        );

        if (ongoingRate) {
          // Close the previous ongoing rate by setting effectiveTo to day before new rate
          const dayBeforeNewRate = new Date(data.effectiveFrom);
          dayBeforeNewRate.setDate(dayBeforeNewRate.getDate() - 1);
          dayBeforeNewRate.setHours(23, 59, 59, 999);

          await prisma.salaryRateSchedule.update({
            where: { id: ongoingRate.id },
            data: { effectiveTo: dayBeforeNewRate },
          });
        } else {
          // There's still an overlap that couldn't be auto-resolved
          throw new ConflictException(
            `An active rate schedule already exists for ${data.category} - ${data.subCategory} that overlaps with the specified date range. ` +
            `Please close the existing rate schedule first or adjust the date range.`,
          );
        }
      }

      // Create the new rate schedule
      return prisma.salaryRateSchedule.create({
        data,
      });
    });
  }

  /**
   * Check for overlapping active rates within a transaction
   * This uses the same logic as hasOverlappingActiveRate but operates within a transaction context
   */
  private async hasOverlappingActiveRateInTransaction(
    prisma: Prisma.TransactionClient,
    category: SalaryCategory,
    subCategory: SalarySubCategory,
    effectiveFrom: Date,
    effectiveTo: Date | null,
  ): Promise<boolean> {
    const where: Prisma.SalaryRateScheduleWhereInput = {
      category,
      subCategory,
      isActive: true,
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

    const count = await prisma.salaryRateSchedule.count({ where });
    return count > 0;
  }
}

