import { PrismaService } from '../src/prisma/prisma.service';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaService();

async function main() {
  const userDepartments = [
    { name: 'HR' },
    { name: 'OPERATIONS' },
    { name: 'ACCOUNTS' },
    { name: 'FIELD' },
    { name: 'ADMIN' },
  ];

  const employeeDepartments = [
    { name: 'OFFICE' },
    { name: 'SECURITY' },
    { name: 'HOUSE_KEEPING' },
    { name: 'MANPOWER' },
    { name: 'LABOR' },
    { name: 'WASTE_MANAGEMENT_SYSTEM' },
  ];

  const availableDesignations = [
    { name: 'SECURITY_GUARD' },
    { name: 'LADY_GUARD' },
    { name: 'SECURITY_SUPERVISOR' },
    { name: 'HOUSE_KEEPING_BOY' },
    { name: 'HOUSE_KEEPING_SUPERVISOR' },
    { name: 'SECURITY_OFFICER' },
    { name: 'MULTI_SKILLED_TECHNICIAN_(MST)' },
    { name: 'HELPER' },
    { name: 'LABOR' },
    { name: 'ELECTRICIAN' },
    { name: 'PLUMBER' },
    { name: 'SITE_SUPERVISOR' },
    { name: 'SITE_MANAGER' },
    { name: 'FACILITY_MANAGER' },
    { name: 'COMPUTER_OPERATOR' },
    { name: 'ACCOUNTS' },
    { name: 'HR' },
    { name: 'OPERATIONS' },
    { name: 'ADMIN' },
  ];

  await prisma.userDepartment.createMany({
    data: userDepartments,
    skipDuplicates: true,
  });

  await prisma.employeeDepartment.createMany({
    data: employeeDepartments,
    skipDuplicates: true,
  });

  await prisma.designation.createMany({
    data: availableDesignations,
    skipDuplicates: true,
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
