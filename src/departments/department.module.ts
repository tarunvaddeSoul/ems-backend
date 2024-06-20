import { Module } from "@nestjs/common";
import { DepartmentController } from "./department.controller";
import { DepartmentService } from "./department.service";
import { DepartmentRepository } from "./department.repository";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    controllers: [DepartmentController],
    providers: [DepartmentService, DepartmentRepository, PrismaService]
})
export class DepartmentModule {}
