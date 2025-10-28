import {
  SalaryFieldCategory,
  SalaryFieldPurpose,
  SalaryFieldType,
  SalaryPaidStatus,
} from '../src/company/enum/company.enum';
import { PrismaService } from '../src/prisma/prisma.service';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaService();

export const DEFAULT_SALARY_TEMPLATE_CONFIG = {
  mandatoryFields: [
    {
      key: 'serialNumber',
      label: 'S.No',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: true,
    },
    {
      key: 'companyName',
      label: 'Company Name',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: true,
    },
    {
      key: 'employeeName',
      label: 'Employee Name',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: true,
    },
    {
      key: 'designation',
      label: 'Designation',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: true,
    },
    {
      key: 'monthlyPay',
      label: 'Monthly Pay',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.CALCULATION,
      enabled: true,
    },
    {
      key: 'basicDuty',
      label: 'Basic Duty',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.MANDATORY_WITH_RULES,
      purpose: SalaryFieldPurpose.CALCULATION,
      enabled: true,
      rules: {
        minValue: 26,
        maxValue: 31,
        defaultValue: 30,
      },
    },
    {
      key: 'bonus',
      label: 'Bonus',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.ALLOWANCE,
      enabled: true,
    },
    {
      key: 'grossSalary',
      label: 'Gross Salary',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.CALCULATION,
      enabled: true,
    },
    {
      key: 'pf',
      label: 'PF (12%)',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.DEDUCTION,
      enabled: true,
    },
    {
      key: 'esic',
      label: 'ESIC (0.75%)',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.DEDUCTION,
      enabled: true,
    },
    {
      key: 'totalDeduction',
      label: 'Total Deduction',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.CALCULATION,
      enabled: true,
    },
    {
      key: 'netSalary',
      label: 'Net Salary',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.MANDATORY_NO_RULES,
      purpose: SalaryFieldPurpose.CALCULATION,
      enabled: true,
    },
  ],
  optionalFields: [
    {
      key: 'status',
      label: 'Status',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
    },
    {
      key: 'uanNumber',
      label: 'UAN No.',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
    },
    {
      key: 'pfPaidStatus',
      label: 'PF Paid Status',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
    },
    {
      key: 'esicNumber',
      label: 'ESIC NO',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
    },
    {
      key: 'esicFilingStatus',
      label: 'ESIC Filing Status',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
    },
    {
      key: 'bankAccountNumber',
      label: 'Bank Account Number',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
    },
    {
      key: 'ifscCode',
      label: 'IFSC Code',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
    },
    {
      key: 'fatherName',
      label: 'Father Name',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
    },
    {
      key: 'wagesPerDay',
      label: 'Wages Per Day',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.CALCULATION,
      enabled: false,
    },
    {
      key: 'epfWages',
      label: 'EPF Wages',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.CALCULATION,
      enabled: false,
    },
    {
      key: 'advance',
      label: 'Advance',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.DEDUCTION,
      enabled: false,
    },
    {
      key: 'uniform',
      label: 'Uniform',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.DEDUCTION,
      enabled: false,
    },
    {
      key: 'penalty',
      label: 'Penalty',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.OPTIONAL_NO_RULES,
      purpose: SalaryFieldPurpose.DEDUCTION,
      enabled: false,
    },
    {
      key: 'otherDeductions',
      label: 'Other Deductions',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.OPTIONAL_WITH_RULES,
      purpose: SalaryFieldPurpose.DEDUCTION,
      enabled: false,
      rules: {
        requireRemarks: true,
      },
    },
    {
      key: 'otherDeductionsRemark',
      label: 'Other Deductions Remark',
      type: SalaryFieldType.TEXT,
      category: SalaryFieldCategory.OPTIONAL_WITH_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
    },
    {
      key: 'salaryPaidStatus',
      label: 'Salary Paid Status',
      type: SalaryFieldType.SELECT,
      category: SalaryFieldCategory.OPTIONAL_WITH_RULES,
      purpose: SalaryFieldPurpose.INFORMATION,
      enabled: false,
      rules: {
        allowedValues: [
          SalaryPaidStatus.PAID,
          SalaryPaidStatus.PENDING,
          SalaryPaidStatus.HOLD,
        ],
      },
    },
    {
      key: 'lwf',
      label: 'LWF',
      type: SalaryFieldType.NUMBER,
      category: SalaryFieldCategory.OPTIONAL_WITH_RULES,
      purpose: SalaryFieldPurpose.DEDUCTION,
      enabled: false,
      rules: {
        defaultValue: 10,
      },
    },
  ],
};

async function seedDepartments() {
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

  await prisma.userDepartment.createMany({
    data: userDepartments,
    skipDuplicates: true,
  });

  await prisma.employeeDepartment.createMany({
    data: employeeDepartments,
    skipDuplicates: true,
  });

  console.log('Seeding finished.');
}

async function seedDesignations() {
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

  await prisma.designation.createMany({
    data: availableDesignations,
    skipDuplicates: true,
  });

  console.log('Seeding finished.');
}

// async function seedSalaryTemplate() {

// }

async function main() {
  await seedDepartments();
  await seedDesignations();
  // await seedSalaryTemplate();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
