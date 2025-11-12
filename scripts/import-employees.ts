#!/usr/bin/env ts-node

/**
 * Employee Bulk Import Script
 * 
 * This script imports employees from a CSV file into the database.
 * It handles validation, error reporting, and transaction management.
 * 
 * Usage:
 *   npm run import:employees <path-to-csv-file>
 *   or
 *   ts-node scripts/import-employees.ts <path-to-csv-file>
 * 
 * Example:
 *   npm run import:employees employee-bulk-import-template.csv
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Types
interface CsvRow {
  [key: string]: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    employee: string;
    errors: string[];
  }>;
  warnings: Array<{
    row: number;
    employee: string;
    warning: string;
  }>;
}

interface EmployeeData {
  // Basic Employee Info
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  husbandName?: string;
  bloodGroup: string;
  highestEducationQualification: string;
  employeeOnboardingDate: string;
  status: string;
  category: string;
  recruitedBy: string;
  age: string;
  
  // Salary Info
  salaryCategory?: string;
  salarySubCategory?: string;
  monthlySalary?: string;
  pfEnabled: string;
  esicEnabled: string;
  
  // Contact Details
  mobileNumber: string;
  aadhaarNumber: string;
  permanentAddress: string;
  presentAddress: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  
  // Bank Details
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  bankCity: string;
  
  // Additional Details
  pfUanNumber: string;
  esicNumber: string;
  policeVerificationNumber: string;
  policeVerificationDate: string;
  trainingCertificateNumber: string;
  trainingCertificateDate: string;
  medicalCertificateNumber: string;
  medicalCertificateDate: string;
  
  // Reference Details
  referenceName: string;
  referenceAddress: string;
  referenceNumber: string;
}

class EmployeeImporter {
  private prisma: PrismaClient;
  private result: ImportResult;

  constructor() {
    this.prisma = new PrismaClient();
    this.result = {
      success: true,
      totalRows: 0,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Parse CSV file and return rows
   */
  private parseCsv(filePath: string): CsvRow[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
      }
      
      const row: CsvRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      rows.push(row);
    }

    return rows;
  }

  /**
   * Parse CSV line handling quoted values
   */
  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current); // Add last value
    
    return values;
  }

  /**
   * Validate employee data
   */
  private validateEmployeeData(data: CsvRow, rowNumber: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const employeeName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || `Row ${rowNumber}`;

    // Required fields
    const requiredFields = [
      'title', 'firstName', 'lastName', 'dateOfBirth', 'gender',
      'fatherName', 'motherName', 'bloodGroup', 'highestEducationQualification',
      'employeeOnboardingDate', 'status', 'category', 'recruitedBy', 'age',
      'pfEnabled', 'esicEnabled', 'mobileNumber', 'aadhaarNumber',
      'permanentAddress', 'presentAddress', 'city', 'district', 'state', 'pincode',
      'bankAccountNumber', 'ifscCode', 'bankName', 'bankCity',
      'pfUanNumber', 'esicNumber', 'policeVerificationNumber', 'policeVerificationDate',
      'trainingCertificateNumber', 'trainingCertificateDate',
      'medicalCertificateNumber', 'medicalCertificateDate',
      'referenceName', 'referenceAddress', 'referenceNumber'
    ];

    requiredFields.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate enums
    const validTitle = ['MR', 'MS'].includes(data.title);
    if (!validTitle) errors.push(`Invalid title: ${data.title}. Must be MR or MS`);

    const validGender = ['MALE', 'FEMALE'].includes(data.gender);
    if (!validGender) errors.push(`Invalid gender: ${data.gender}. Must be MALE or FEMALE`);

    const validStatus = ['ACTIVE', 'INACTIVE'].includes(data.status);
    if (!validStatus) errors.push(`Invalid status: ${data.status}. Must be ACTIVE or INACTIVE`);

    const validCategory = ['SC', 'ST', 'OBC', 'GENERAL'].includes(data.category);
    if (!validCategory) errors.push(`Invalid category: ${data.category}. Must be SC, ST, OBC, or GENERAL`);

    const validEducation = ['UNDER_8', 'EIGHT', 'TEN', 'TWELVE', 'GRADUATE', 'POST_GRADUATE'].includes(data.highestEducationQualification);
    if (!validEducation) {
      errors.push(`Invalid education: ${data.highestEducationQualification}. Must be UNDER_8, EIGHT, TEN, TWELVE, GRADUATE, or POST_GRADUATE`);
    }

    // Validate dates (DD-MM-YYYY format)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(data.dateOfBirth)) {
      errors.push(`Invalid dateOfBirth format: ${data.dateOfBirth}. Must be DD-MM-YYYY`);
    }
    if (!dateRegex.test(data.employeeOnboardingDate)) {
      errors.push(`Invalid employeeOnboardingDate format: ${data.employeeOnboardingDate}. Must be DD-MM-YYYY`);
    }
    if (!dateRegex.test(data.policeVerificationDate)) {
      errors.push(`Invalid policeVerificationDate format: ${data.policeVerificationDate}. Must be DD-MM-YYYY`);
    }
    if (!dateRegex.test(data.trainingCertificateDate)) {
      errors.push(`Invalid trainingCertificateDate format: ${data.trainingCertificateDate}. Must be DD-MM-YYYY`);
    }
    if (!dateRegex.test(data.medicalCertificateDate)) {
      errors.push(`Invalid medicalCertificateDate format: ${data.medicalCertificateDate}. Must be DD-MM-YYYY`);
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(data.mobileNumber)) {
      errors.push(`Invalid mobileNumber: ${data.mobileNumber}. Must be 10 digits`);
    }

    // Validate aadhaar number (12 digits)
    if (!/^\d{12}$/.test(data.aadhaarNumber)) {
      errors.push(`Invalid aadhaarNumber: ${data.aadhaarNumber}. Must be 12 digits`);
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(data.pincode)) {
      errors.push(`Invalid pincode: ${data.pincode}. Must be 6 digits`);
    }

    // Validate age (number)
    const age = parseInt(data.age, 10);
    if (isNaN(age) || age < 0 || age > 150) {
      errors.push(`Invalid age: ${data.age}. Must be a number between 0 and 150`);
    }

    // Validate boolean fields
    const validPfEnabled = ['true', 'false'].includes(data.pfEnabled.toLowerCase());
    if (!validPfEnabled) errors.push(`Invalid pfEnabled: ${data.pfEnabled}. Must be true or false`);

    const validEsicEnabled = ['true', 'false'].includes(data.esicEnabled.toLowerCase());
    if (!validEsicEnabled) errors.push(`Invalid esicEnabled: ${data.esicEnabled}. Must be true or false`);

    // Validate salary category and sub-category
    if (data.salaryCategory) {
      const validSalaryCategory = ['CENTRAL', 'STATE', 'SPECIALIZED'].includes(data.salaryCategory);
      if (!validSalaryCategory) {
        errors.push(`Invalid salaryCategory: ${data.salaryCategory}. Must be CENTRAL, STATE, or SPECIALIZED`);
      }

      if (data.salaryCategory === 'CENTRAL' || data.salaryCategory === 'STATE') {
        if (!data.salarySubCategory) {
          errors.push(`salarySubCategory is required for ${data.salaryCategory} category`);
        } else {
          const validSubCategory = ['SKILLED', 'UNSKILLED', 'HIGHSKILLED', 'SEMISKILLED'].includes(data.salarySubCategory);
          if (!validSubCategory) {
            errors.push(`Invalid salarySubCategory: ${data.salarySubCategory}. Must be SKILLED, UNSKILLED, HIGHSKILLED, or SEMISKILLED`);
          }
        }
        if (data.monthlySalary) {
          errors.push(`monthlySalary should be empty for ${data.salaryCategory} category`);
        }
      } else if (data.salaryCategory === 'SPECIALIZED') {
        if (data.salarySubCategory) {
          errors.push(`salarySubCategory should be empty for SPECIALIZED category`);
        }
        if (!data.monthlySalary) {
          errors.push(`monthlySalary is required for SPECIALIZED category`);
        } else {
          const monthlySalary = parseFloat(data.monthlySalary);
          if (isNaN(monthlySalary) || monthlySalary < 0) {
            errors.push(`Invalid monthlySalary: ${data.monthlySalary}. Must be a positive number`);
          }
        }
      }
    }

    // Check for duplicate mobile number and aadhaar (will be checked in DB)
    // This is just a warning, actual check happens during insert

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert date string (DD-MM-YYYY) to Date object
   */
  private parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Import a single employee
   */
  private async importEmployee(data: CsvRow, rowNumber: number): Promise<boolean> {
    const employeeName = `${data.firstName} ${data.lastName}`;
    
    try {
      // Use transaction to ensure all-or-nothing
      await this.prisma.$transaction(async (tx) => {
        // Create employee
        const employee = await tx.employee.create({
          data: {
            title: data.title as any,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender as any,
            fatherName: data.fatherName,
            motherName: data.motherName,
            husbandName: data.husbandName || null,
            bloodGroup: data.bloodGroup,
            highestEducationQualification: data.highestEducationQualification as any,
            employeeOnboardingDate: data.employeeOnboardingDate,
            employeeRelievingDate: null,
            status: data.status as any,
            category: data.category as any,
            recruitedBy: data.recruitedBy,
            age: parseInt(data.age, 10),
            salaryCategory: data.salaryCategory as any || null,
            salarySubCategory: data.salarySubCategory as any || null,
            monthlySalary: data.monthlySalary ? parseFloat(data.monthlySalary) : null,
            salaryPerDay: null, // Will be set based on salary rate schedule if needed
            pfEnabled: data.pfEnabled.toLowerCase() === 'true',
            esicEnabled: data.esicEnabled.toLowerCase() === 'true',
          },
        });

        // Create contact details
        await tx.employeeContactDetails.create({
          data: {
            employeeId: employee.id,
            mobileNumber: data.mobileNumber,
            aadhaarNumber: data.aadhaarNumber,
            permanentAddress: data.permanentAddress,
            presentAddress: data.presentAddress,
            city: data.city,
            district: data.district,
            state: data.state,
            pincode: parseInt(data.pincode, 10),
          },
        });

        // Create bank details
        await tx.employeeBankDetails.create({
          data: {
            employeeId: employee.id,
            bankAccountNumber: data.bankAccountNumber,
            ifscCode: data.ifscCode,
            bankName: data.bankName,
            bankCity: data.bankCity,
          },
        });

        // Create additional details
        await tx.employeeAdditionalDetails.create({
          data: {
            employeeId: employee.id,
            pfUanNumber: data.pfUanNumber,
            esicNumber: data.esicNumber,
            policeVerificationNumber: data.policeVerificationNumber,
            policeVerificationDate: data.policeVerificationDate,
            trainingCertificateNumber: data.trainingCertificateNumber,
            trainingCertificateDate: data.trainingCertificateDate,
            medicalCertificateNumber: data.medicalCertificateNumber,
            medicalCertificateDate: data.medicalCertificateDate,
          },
        });

        // Create reference details
        await tx.employeeReferenceDetails.create({
          data: {
            employeeId: employee.id,
            referenceName: data.referenceName,
            referenceAddress: data.referenceAddress,
            referenceNumber: data.referenceNumber,
          },
        });
      });

      return true;
    } catch (error: any) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new Error(`Duplicate ${field}: ${error.meta?.target?.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Main import function
   */
  async importFromCsv(filePath: string): Promise<ImportResult> {
    console.log(`\n🚀 Starting employee import from: ${filePath}\n`);

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Parse CSV
      console.log('📖 Parsing CSV file...');
      const rows = this.parseCsv(filePath);
      this.result.totalRows = rows.length;
      console.log(`✅ Found ${rows.length} employee(s) to import\n`);

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed
        const employeeName = `${row.firstName || ''} ${row.lastName || ''}`.trim() || `Row ${rowNumber}`;

        console.log(`[${i + 1}/${rows.length}] Processing: ${employeeName}...`);

        // Validate
        const validation = this.validateEmployeeData(row, rowNumber);
        if (!validation.valid) {
          this.result.failed++;
          this.result.errors.push({
            row: rowNumber,
            employee: employeeName,
            errors: validation.errors,
          });
          console.log(`  ❌ Validation failed: ${validation.errors.join('; ')}\n`);
          continue;
        }

        // Import
        try {
          const success = await this.importEmployee(row, rowNumber);
          if (success) {
            this.result.successful++;
            console.log(`  ✅ Successfully imported\n`);
          }
        } catch (error: any) {
          this.result.failed++;
          this.result.errors.push({
            row: rowNumber,
            employee: employeeName,
            errors: [error.message || String(error)],
          });
          console.log(`  ❌ Import failed: ${error.message}\n`);
        }
      }

      this.result.success = this.result.failed === 0;

      return this.result;
    } catch (error: any) {
      console.error(`\n❌ Fatal error: ${error.message}\n`);
      throw error;
    }
  }

  /**
   * Print import summary
   */
  printSummary(result: ImportResult): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Rows:     ${result.totalRows}`);
    console.log(`✅ Successful:  ${result.successful}`);
    console.log(`❌ Failed:      ${result.failed}`);
    console.log('='.repeat(80));

    if (result.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      result.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. Row ${error.row} - ${error.employee}:`);
        error.errors.forEach(err => console.log(`   - ${err}`));
      });
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      result.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. Row ${warning.row} - ${warning.employee}:`);
        console.log(`   - ${warning.warning}`);
      });
    }

    console.log('\n');
  }

  /**
   * Cleanup
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: CSV file path is required');
    console.log('\nUsage:');
    console.log('  npm run import:employees <path-to-csv-file>');
    console.log('  or');
    console.log('  ts-node scripts/import-employees.ts <path-to-csv-file>');
    console.log('\nExample:');
    console.log('  npm run import:employees employee-bulk-import-template.csv');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  const importer = new EmployeeImporter();

  try {
    const result = await importer.importFromCsv(filePath);
    importer.printSummary(result);
    
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}\n`);
    process.exit(1);
  } finally {
    await importer.disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { EmployeeImporter };

