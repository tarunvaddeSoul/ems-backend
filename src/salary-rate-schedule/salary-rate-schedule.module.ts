import { Logger, Module } from '@nestjs/common';
import { SalaryRateScheduleService } from './salary-rate-schedule.service';
import { SalaryRateScheduleController } from './salary-rate-schedule.controller';
import { SalaryRateScheduleRepository } from './salary-rate-schedule.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SalaryRateScheduleController],
  providers: [
    SalaryRateScheduleService,
    SalaryRateScheduleRepository,
    PrismaService,
    Logger,
  ],
  exports: [SalaryRateScheduleService, SalaryRateScheduleRepository],
})
export class SalaryRateScheduleModule {}

