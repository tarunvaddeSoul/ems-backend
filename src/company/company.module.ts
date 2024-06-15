import { Logger, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyRepository } from './company.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository, PrismaService, Logger],
})
export class CompanyModule {}
