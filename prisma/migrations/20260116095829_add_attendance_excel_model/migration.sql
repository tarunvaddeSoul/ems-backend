-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HR', 'OPERATIONS', 'ACCOUNTS', 'FIELD', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "PresentDaysCount" AS ENUM ('D26', 'D27', 'D28', 'D29', 'D30', 'D31');

-- CreateEnum
CREATE TYPE "PFOptions" AS ENUM ('TWELVE_PERCENT', 'NO');

-- CreateEnum
CREATE TYPE "ESICOptions" AS ENUM ('ZERO_POINT_SEVEN_FIVE_PERCENT', 'NO');

-- CreateEnum
CREATE TYPE "BONUSOptions" AS ENUM ('EIGHT_POINT_THREE_THREE_PERCENT', 'NO');

-- CreateEnum
CREATE TYPE "LWFOptions" AS ENUM ('TEN_RUPEES', 'NO');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SC', 'ST', 'OBC', 'GENERAL');

-- CreateEnum
CREATE TYPE "EducationQualification" AS ENUM ('UNDER_8', 'EIGHT', 'TEN', 'TWELVE', 'GRADUATE', 'POST_GRADUATE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Title" AS ENUM ('MR', 'MS');

-- CreateEnum
CREATE TYPE "SalaryCategory" AS ENUM ('CENTRAL', 'STATE', 'SPECIALIZED');

-- CreateEnum
CREATE TYPE "SalarySubCategory" AS ENUM ('SKILLED', 'UNSKILLED', 'HIGHSKILLED', 'SEMISKILLED');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('PER_DAY', 'PER_MONTH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDepartment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "UserDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDepartment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EmployeeDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "contactPersonNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "companyOnboardingDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mandatoryFields" JSONB NOT NULL,
    "optionalFields" JSONB NOT NULL,
    "customFields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "companyName" TEXT,
    "companyId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "salaryData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL DEFAULT concat('TSS', lpad(floor(random() * 10000)::text, 4, '0')),
    "title" "Title" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "fatherName" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,
    "husbandName" TEXT,
    "bloodGroup" TEXT NOT NULL,
    "highestEducationQualification" TEXT NOT NULL,
    "employeeOnboardingDate" TEXT NOT NULL,
    "employeeRelievingDate" TEXT,
    "status" "Status" NOT NULL,
    "category" "Category" NOT NULL,
    "recruitedBy" TEXT NOT NULL,
    "age" INTEGER NOT NULL DEFAULT 0,
    "salaryCategory" "SalaryCategory",
    "salarySubCategory" "SalarySubCategory",
    "salaryPerDay" DOUBLE PRECISION,
    "monthlySalary" DOUBLE PRECISION,
    "pfEnabled" BOOLEAN NOT NULL DEFAULT false,
    "esicEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentHistory" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT,
    "companyName" TEXT NOT NULL,
    "designationName" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "designationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "salaryPerDay" DOUBLE PRECISION,
    "salaryType" "SalaryType",
    "joiningDate" TEXT NOT NULL,
    "leavingDate" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmploymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeContactDetails" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "aadhaarNumber" TEXT NOT NULL,
    "permanentAddress" TEXT NOT NULL,
    "presentAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeContactDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeBankDetails" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeBankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAdditionalDetails" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "pfUanNumber" TEXT NOT NULL,
    "esicNumber" TEXT NOT NULL,
    "policeVerificationNumber" TEXT NOT NULL,
    "policeVerificationDate" TEXT NOT NULL,
    "trainingCertificateNumber" TEXT NOT NULL,
    "trainingCertificateDate" TEXT NOT NULL,
    "medicalCertificateNumber" TEXT NOT NULL,
    "medicalCertificateDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAdditionalDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeReferenceDetails" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "referenceName" TEXT NOT NULL,
    "referenceAddress" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeReferenceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDocumentUploads" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "aadhaar" TEXT NOT NULL,
    "panCard" TEXT NOT NULL,
    "bankPassbook" TEXT NOT NULL,
    "markSheet" TEXT NOT NULL,
    "otherDocument" TEXT NOT NULL,
    "otherDocumentRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDocumentUploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "presentCount" INTEGER NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSheet" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "attendanceSheetUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceExcel" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "attendanceExcelUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceExcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryRateSchedule" (
    "id" TEXT NOT NULL,
    "category" "SalaryCategory" NOT NULL,
    "subCategory" "SalarySubCategory" NOT NULL,
    "ratePerDay" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRateSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSalaryHistory" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salaryCategory" "SalaryCategory" NOT NULL,
    "salarySubCategory" "SalarySubCategory",
    "ratePerDay" DOUBLE PRECISION,
    "monthlySalary" DOUBLE PRECISION,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeSalaryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserDepartment_name_key" ON "UserDepartment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeDepartment_name_key" ON "EmployeeDepartment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Designation_name_key" ON "Designation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_key" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResetToken_userId_key" ON "ResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_status_createdAt_idx" ON "Company"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SalaryRecord_companyId_month_idx" ON "SalaryRecord"("companyId", "month");

-- CreateIndex
CREATE INDEX "SalaryRecord_employeeId_idx" ON "SalaryRecord"("employeeId");

-- CreateIndex
CREATE INDEX "SalaryRecord_companyId_idx" ON "SalaryRecord"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryRecord_employeeId_companyId_month_key" ON "SalaryRecord"("employeeId", "companyId", "month");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "Employee"("status");

-- CreateIndex
CREATE INDEX "Employee_firstName_lastName_idx" ON "Employee"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "Employee_status_createdAt_idx" ON "Employee"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Employee_salaryCategory_salarySubCategory_idx" ON "Employee"("salaryCategory", "salarySubCategory");

-- CreateIndex
CREATE INDEX "EmploymentHistory_employeeId_status_idx" ON "EmploymentHistory"("employeeId", "status");

-- CreateIndex
CREATE INDEX "EmploymentHistory_companyId_status_idx" ON "EmploymentHistory"("companyId", "status");

-- CreateIndex
CREATE INDEX "EmploymentHistory_employeeId_companyId_idx" ON "EmploymentHistory"("employeeId", "companyId");

-- CreateIndex
CREATE INDEX "EmploymentHistory_status_idx" ON "EmploymentHistory"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeContactDetails_employeeId_key" ON "EmployeeContactDetails"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeContactDetails_mobileNumber_idx" ON "EmployeeContactDetails"("mobileNumber");

-- CreateIndex
CREATE INDEX "EmployeeContactDetails_aadhaarNumber_idx" ON "EmployeeContactDetails"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeBankDetails_employeeId_key" ON "EmployeeBankDetails"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAdditionalDetails_employeeId_key" ON "EmployeeAdditionalDetails"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeReferenceDetails_employeeId_key" ON "EmployeeReferenceDetails"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeDocumentUploads_employeeId_key" ON "EmployeeDocumentUploads"("employeeId");

-- CreateIndex
CREATE INDEX "Attendance_companyId_month_idx" ON "Attendance"("companyId", "month");

-- CreateIndex
CREATE INDEX "Attendance_employeeId_idx" ON "Attendance"("employeeId");

-- CreateIndex
CREATE INDEX "Attendance_companyId_idx" ON "Attendance"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_employeeId_companyId_month_key" ON "Attendance"("employeeId", "companyId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSheet_companyId_month_key" ON "AttendanceSheet"("companyId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceExcel_companyId_month_key" ON "AttendanceExcel"("companyId", "month");

-- CreateIndex
CREATE INDEX "SalaryRateSchedule_category_subCategory_effectiveFrom_idx" ON "SalaryRateSchedule"("category", "subCategory", "effectiveFrom");

-- CreateIndex
CREATE INDEX "SalaryRateSchedule_isActive_idx" ON "SalaryRateSchedule"("isActive");

-- CreateIndex
CREATE INDEX "SalaryRateSchedule_category_subCategory_isActive_idx" ON "SalaryRateSchedule"("category", "subCategory", "isActive");

-- CreateIndex
CREATE INDEX "EmployeeSalaryHistory_employeeId_effectiveFrom_idx" ON "EmployeeSalaryHistory"("employeeId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "EmployeeSalaryHistory_employeeId_effectiveFrom_effectiveTo_idx" ON "EmployeeSalaryHistory"("employeeId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "EmployeeSalaryHistory_employeeId_idx" ON "EmployeeSalaryHistory"("employeeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "UserDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryTemplate" ADD CONSTRAINT "SalaryTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "EmployeeDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeContactDetails" ADD CONSTRAINT "EmployeeContactDetails_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBankDetails" ADD CONSTRAINT "EmployeeBankDetails_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAdditionalDetails" ADD CONSTRAINT "EmployeeAdditionalDetails_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeReferenceDetails" ADD CONSTRAINT "EmployeeReferenceDetails_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocumentUploads" ADD CONSTRAINT "EmployeeDocumentUploads_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalaryHistory" ADD CONSTRAINT "EmployeeSalaryHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
