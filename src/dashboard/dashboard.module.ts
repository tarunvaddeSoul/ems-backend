import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, PrismaService],
})
export class DashboardModule {}