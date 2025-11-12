# Scripts Directory

This directory contains utility scripts for the EMS Backend application.

## Employee Import Script

### `import-employees.ts`

A production-grade script for bulk importing employees from CSV files.

#### Features

- ✅ **Comprehensive Validation**: Validates all required fields, data types, formats, and business rules
- ✅ **Transaction Management**: Uses database transactions to ensure data consistency
- ✅ **Error Handling**: Detailed error reporting with row numbers and specific error messages
- ✅ **Progress Tracking**: Real-time progress updates during import
- ✅ **Summary Report**: Complete summary with success/failure counts and detailed error list
- ✅ **CSV Parsing**: Handles quoted values and special characters correctly
- ✅ **Type Safety**: Full TypeScript support with proper types

#### Usage

```bash
# Using npm script
npm run import:employees <path-to-csv-file>

# Direct execution
ts-node -r tsconfig-paths/register scripts/import-employees.ts <path-to-csv-file>
```

#### Examples

```bash
# Import from template file
npm run import:employees employee-bulk-import-template.csv

# Import from absolute path
npm run import:employees /path/to/employees.csv

# Import from relative path
npm run import:employees ./data/employees-2024-01.csv
```

#### CSV File Requirements

1. **Headers**: Must be in camelCase format matching database schema
   - ✅ Correct: `firstName`, `lastName`, `dateOfBirth`
   - ❌ Wrong: `First Name`, `Last Name`, `Date of Birth`

2. **Format**: Standard CSV format with comma separators
3. **Encoding**: UTF-8 encoding
4. **Required Fields**: All fields listed in the template are required (except optional ones)

#### Validation Rules

The script validates:

- **Required Fields**: All mandatory fields must be present
- **Data Types**: Numbers, booleans, dates are validated
- **Formats**: 
  - Dates: `DD-MM-YYYY` format
  - Mobile: 10 digits
  - Aadhaar: 12 digits
  - PIN: 6 digits
- **Enums**: Title, Gender, Status, Category, Education, Salary Category/Sub-Category
- **Business Rules**:
  - CENTRAL/STATE must have `salarySubCategory`, no `monthlySalary`
  - SPECIALIZED must have `monthlySalary`, no `salarySubCategory`
- **Uniqueness**: Checks for duplicate mobile numbers and Aadhaar numbers

#### Output

The script provides:

1. **Real-time Progress**: Shows current row being processed
2. **Validation Errors**: Immediate feedback on validation failures
3. **Import Status**: Success/failure for each row
4. **Summary Report**: 
   - Total rows processed
   - Success count
   - Failure count
   - Detailed error list with row numbers

#### Error Handling

- **Validation Errors**: Caught before database operations
- **Database Errors**: Handled with transaction rollback
- **Duplicate Errors**: Specific messages for unique constraint violations
- **Fatal Errors**: File not found, parsing errors, etc.

#### Example Output

```
🚀 Starting employee import from: employee-bulk-import-template.csv

📖 Parsing CSV file...
✅ Found 2 employee(s) to import

[1/2] Processing: John Doe...
  ✅ Successfully imported

[2/2] Processing: Jane Smith...
  ✅ Successfully imported

================================================================================
📊 IMPORT SUMMARY
================================================================================
Total Rows:     2
✅ Successful:  2
❌ Failed:      0
================================================================================
```

#### Exit Codes

- `0`: All employees imported successfully
- `1`: One or more employees failed to import or fatal error occurred

#### Best Practices

1. **Backup Database**: Always backup your database before running bulk imports
2. **Test First**: Test with a small CSV file first
3. **Review Errors**: Check the error summary and fix issues before re-running
4. **Validate CSV**: Ensure CSV file matches the template format exactly
5. **Check Headers**: Verify headers are in camelCase and not modified

#### Troubleshooting

**Common Issues:**

1. **"File not found"**: Check file path is correct
2. **"Column count mismatch"**: Ensure CSV has correct number of columns
3. **"Invalid date format"**: Dates must be in `DD-MM-YYYY` format
4. **"Duplicate field"**: Employee with same mobile/aadhaar already exists
5. **"Missing required field"**: Check all required fields are filled

#### Security Notes

- Script uses Prisma client with connection pooling
- Transactions ensure data consistency
- Input validation prevents SQL injection
- No sensitive data is logged

