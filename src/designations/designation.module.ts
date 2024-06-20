import { Module } from '@nestjs/common';
import { DesignationService } from './designation.service';
import { DesignationController } from './designation.controller';
import { DesignationRepository } from './designation.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DesignationController],
  providers: [DesignationService, DesignationRepository, PrismaService],
})
export class DesignationModule {}
