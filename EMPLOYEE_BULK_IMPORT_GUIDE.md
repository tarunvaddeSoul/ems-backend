# Employee Bulk Import CSV Template Guide

## ⚠️ IMPORTANT: DO NOT MODIFY HEADERS

**CRITICAL:** The column headers in this CSV file are in **camelCase** format (e.g., `firstName`, `lastName`, `dateOfBirth`) and **MUST NOT BE CHANGED**. 

- ❌ **DO NOT** change headers to human-readable format (e.g., "First Name", "Last Name", "Date of Birth")
- ❌ **DO NOT** add spaces, special characters, or change the casing
- ✅ **KEEP** headers exactly as they are: `firstName`, `lastName`, `dateOfBirth`, etc.

The headers match the database field names exactly. Changing them will cause the import script to fail.

## CSV File Format

This CSV template is designed for bulk importing employees with basic details, salary information, contact details, bank details, additional details, and reference details.

**Header Format:** All headers are in camelCase matching the database schema (e.g., `firstName`, `mobileNumber`, `bankAccountNumber`)

## Column Descriptions

### Basic Employee Information

| Column | Required | Type | Description | Valid Values |
|--------|----------|------|-------------|--------------|
| `title` | Yes | String | Employee title | `MR`, `MS` |
| `firstName` | Yes | String | First name | Any string |
| `lastName` | Yes | String | Last name | Any string |
| `dateOfBirth` | Yes | String | Date of birth | Format: `DD-MM-YYYY` (e.g., `15-05-1990`) |
| `gender` | Yes | Enum | Gender | `MALE`, `FEMALE` |
| `fatherName` | Yes | String | Father's name | Any string |
| `motherName` | Yes | String | Mother's name | Any string |
| `husbandName` | Optional | String | Husband's name (for married females) | Any string or leave empty |
| `bloodGroup` | Yes | String | Blood group | Any string (e.g., `O+`, `A+`, `B+`, `AB+`) |
| `highestEducationQualification` | Yes | Enum | Education qualification | `UNDER_8`, `EIGHT`, `TEN`, `TWELVE`, `GRADUATE`, `POST_GRADUATE` |
| `employeeOnboardingDate` | Yes | String | Date of joining | Format: `DD-MM-YYYY` (e.g., `01-01-2024`) |
| `status` | Yes | Enum | Employment status | `ACTIVE`, `INACTIVE` |
| `category` | Yes | Enum | Category | `SC`, `ST`, `OBC`, `GENERAL` |
| `recruitedBy` | Yes | String | Recruiter name | Any string |
| `age` | Yes | Number | Age in years | Integer (e.g., `34`) |

### Salary Information

| Column | Required | Type | Description | Valid Values |
|--------|----------|------|-------------|--------------|
| `salaryCategory` | Optional | Enum | Salary category | `CENTRAL`, `STATE`, `SPECIALIZED` |
| `salarySubCategory` | Optional | Enum | Salary sub-category | `SKILLED`, `UNSKILLED`, `HIGHSKILLED`, `SEMISKILLED` (Required if salaryCategory is CENTRAL or STATE) |
| `monthlySalary` | Optional | Number | Monthly salary | Decimal number (e.g., `50000`) - Required for SPECIALIZED category |
| `pfEnabled` | Yes | Boolean | PF enabled | `true`, `false` |
| `esicEnabled` | Yes | Boolean | ESIC enabled | `true`, `false` |

**Note:** 
- For `CENTRAL` or `STATE` category: `salarySubCategory` is required, `monthlySalary` should be empty
- For `SPECIALIZED` category: `monthlySalary` is required, `salarySubCategory` should be empty

### Contact Details

| Column | Required | Type | Description | Format/Example |
|--------|----------|------|-------------|----------------|
| `mobileNumber` | Yes | String | Mobile number | 10 digits (e.g., `9876543210`) |
| `aadhaarNumber` | Yes | String | Aadhaar number | 12 digits (e.g., `123456789012`) |
| `permanentAddress` | Yes | String | Permanent address | Any string |
| `presentAddress` | Yes | String | Present address | Any string |
| `city` | Yes | String | City | Any string |
| `district` | Yes | String | District | Any string |
| `state` | Yes | String | State | Any string |
| `pincode` | Yes | Number | PIN code | 6 digits (e.g., `400001`) |

### Bank Details

| Column | Required | Type | Description | Format/Example |
|--------|----------|------|-------------|----------------|
| `bankAccountNumber` | Yes | String | Bank account number | Any string (e.g., `1234567890123`) |
| `ifscCode` | Yes | String | IFSC code | Format: `AAAA0XXXXX` (e.g., `SBIN0001234`) |
| `bankName` | Yes | String | Bank name | Any string (e.g., `State Bank of India`) |
| `bankCity` | Yes | String | Bank city | Any string (e.g., `Mumbai`) |

### Additional Details

| Column | Required | Type | Description | Format/Example |
|--------|----------|------|-------------|----------------|
| `pfUanNumber` | Yes | String | PF UAN number | Any string (e.g., `123456789012`) |
| `esicNumber` | Yes | String | ESIC number | Any string (e.g., `987654321098`) |
| `policeVerificationNumber` | Yes | String | Police verification number | Any string (e.g., `PV123456`) |
| `policeVerificationDate` | Yes | String | Police verification date | Format: `DD-MM-YYYY` (e.g., `15-01-2024`) |
| `trainingCertificateNumber` | Yes | String | Training certificate number | Any string (e.g., `TC123456`) |
| `trainingCertificateDate` | Yes | String | Training certificate date | Format: `DD-MM-YYYY` (e.g., `20-01-2024`) |
| `medicalCertificateNumber` | Yes | String | Medical certificate number | Any string (e.g., `MC123456`) |
| `medicalCertificateDate` | Yes | String | Medical certificate date | Format: `DD-MM-YYYY` (e.g., `25-01-2024`) |

### Reference Details

| Column | Required | Type | Description | Format/Example |
|--------|----------|------|-------------|----------------|
| `referenceName` | Yes | String | Reference person name | Any string |
| `referenceAddress` | Yes | String | Reference address | Any string |
| `referenceNumber` | Yes | String | Reference contact number | Any string (e.g., `9876543210`) |

## Example CSV Rows

### Example 1: SPECIALIZED Employee
```csv
MR,John,Doe,15-05-1990,MALE,John Senior,Mary Doe,,O+,GRADUATE,01-01-2024,ACTIVE,GENERAL,HR Team,34,SPECIALIZED,,50000,true,true,9876543210,123456789012,123 Main Street City,123 Main Street City,Mumbai,Mumbai Suburban,Maharashtra,400001,1234567890123,SBIN0001234,State Bank of India,Mumbai,123456789012,987654321098,PV123456,15-01-2024,TC123456,20-01-2024,MC123456,25-01-2024,Reference Person,456 Reference Street,9876543210
```

### Example 2: CENTRAL Employee (SKILLED)
```csv
MS,Jane,Smith,20-08-1992,FEMALE,Robert Smith,Susan Smith,,B+,POST_GRADUATE,01-02-2024,ACTIVE,GENERAL,HR Team,32,CENTRAL,SKILLED,,true,true,9876543211,123456789013,789 Park Avenue,789 Park Avenue,Delhi,New Delhi,Delhi,110001,1234567890124,HDFC0005678,HDFC Bank,Delhi,123456789013,987654321099,PV123457,16-01-2024,TC123457,21-01-2024,MC123457,26-01-2024,Reference Person 2,789 Reference Lane,9876543211
```

### Example 3: STATE Employee (UNSKILLED)
```csv
MR,Raj,Kumar,10-03-1988,MALE,Ram Kumar,Shanti Devi,,A+,TEN,15-01-2024,ACTIVE,OBC,Manager,36,STATE,UNSKILLED,,true,true,9876543212,123456789014,456 Village Road,456 Village Road,Pune,Pune,Maharashtra,411001,1234567890125,ICIC0001234,ICICI Bank,Pune,123456789014,987654321100,PV123458,17-01-2024,TC123458,22-01-2024,MC123458,27-01-2024,Reference Person 3,123 Reference Road,9876543212
```

## Important Notes

1. **Date Format**: All dates must be in `DD-MM-YYYY` format (e.g., `15-05-1990`)
2. **Boolean Values**: Use `true` or `false` (lowercase) for `pfEnabled` and `esicEnabled`
3. **Empty Fields**: Leave empty fields as empty (no spaces). For optional fields like `husbandName`, leave the cell empty
4. **Salary Category Rules**:
   - `CENTRAL` or `STATE`: Must have `salarySubCategory`, leave `monthlySalary` empty
   - `SPECIALIZED`: Must have `monthlySalary`, leave `salarySubCategory` empty
5. **CSV Encoding**: Save the file in UTF-8 encoding
6. **Special Characters**: If your data contains commas, wrap the field in double quotes (e.g., `"Smith, John"`)
7. **No Documents**: This template does NOT include document uploads (photo, aadhaar, PAN, etc.)
8. **No Employment History**: This template does NOT include employment history (company, designation, department assignment)

## Validation Rules

- All required fields must be filled
- Mobile number must be exactly 10 digits
- Aadhaar number must be exactly 12 digits
- PIN code must be exactly 6 digits
- Age must be a valid number
- Dates must be in DD-MM-YYYY format
- Enum values must match exactly (case-sensitive)
- Boolean values must be `true` or `false` (lowercase)

## Common Errors to Avoid

1. ❌ **MODIFYING HEADERS** - Changing `firstName` to "First Name" or any other format (THIS WILL BREAK THE IMPORT SCRIPT)
2. ❌ Using `True` or `TRUE` instead of `true` for boolean fields
3. ❌ Using `YYYY-MM-DD` format instead of `DD-MM-YYYY` for dates
4. ❌ Including spaces in empty fields
5. ❌ Missing required fields
6. ❌ Using invalid enum values (case-sensitive)
7. ❌ Providing `monthlySalary` for CENTRAL/STATE employees
8. ❌ Providing `salarySubCategory` for SPECIALIZED employees

## For Script Developers

When writing the import script, the CSV headers are in camelCase and match the database schema exactly:

- Headers: `firstName`, `lastName`, `dateOfBirth`, `mobileNumber`, etc.
- These map directly to database fields
- No header transformation is needed
- Read headers as-is from the first row of the CSV

Example script structure:
```javascript
// Read CSV
const headers = csvRows[0]; // ['title', 'firstName', 'lastName', ...]
const dataRows = csvRows.slice(1);

// Headers match DB fields directly - no mapping needed
dataRows.forEach(row => {
  const employee = {
    title: row[headers.indexOf('title')],
    firstName: row[headers.indexOf('firstName')],
    lastName: row[headers.indexOf('lastName')],
    // ... etc
  };
});
```

