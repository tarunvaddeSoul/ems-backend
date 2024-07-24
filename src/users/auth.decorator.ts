import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './role.guard';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth('Bearer'),
    Roles(...roles)
  );
}