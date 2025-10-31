# Complete Swagger API Documentation

## Overview

This document provides comprehensive information about the Swagger/OpenAPI documentation for the entire EMS Backend codebase.

## Access Points

### Swagger UI
- **URL**: `http://localhost:3003/api-docs`
- **Features**: Interactive API explorer, try-it-out functionality, request/response schemas

### Swagger JSON (Export)
- **URL**: `http://localhost:3003/api-docs-json`
- **Format**: OpenAPI 3.0 JSON specification
- **Use Cases**: 
  - Import into Postman/Insomnia
  - Generate client SDKs
  - Share with frontend teams
  - Documentation tools integration

## API Modules Covered

### 1. Attendance Module
**Tag**: `Attendance`

**Endpoints**:
- `POST /attendance/mark` - Mark attendance for an employee
- `POST /attendance/bulk` - Bulk mark attendance
- `PATCH /attendance/:id` - Update attendance presentCount
- `GET /attendance` - List attendance with filters
- `GET /attendance/records-by-company/:companyId` - Get by company
- `GET /attendance/employee/:employeeId` - Get by employee
- `GET /attendance/records-by-company-and-month` - Get by company + month
- `GET /attendance/active-employees` - Get active employees for month
- `GET /attendance/reports` - Monthly attendance report (JSON)
- `GET /attendance/reports/pdf` - Monthly attendance report (PDF)
- `POST /attendance/attendance-sheets` - Upload attendance sheet
- `GET /attendance/attendance-sheets` - List attendance sheets
- `DELETE /attendance/attendance-sheets/:id` - Delete attendance sheet
- `DELETE /attendance/:id` - Delete attendance record
- `DELETE /attendance` - Batch delete attendance

**Documentation Status**: ✅ Fully documented with examples, validation rules, and error responses

---

### 2. User Authentication Module
**Tag**: `Users`

**Endpoints**:
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `POST /users/refresh-token/:refreshToken` - Refresh JWT token
- `PUT /users/update/:id` - Update user details (Auth required)
- `PUT /users/change-password` - Change password (Auth required)
- `POST /users/forgot-password` - Send password reset email
- `PUT /users/reset-password` - Reset password with token
- `GET /users/profile` - Get user profile (Auth required)
- `GET /users/me` - Get current user (Auth required)
- `POST /users/logout` - Logout user (Auth required)
- `GET /users/admin-only` - Admin only endpoint (Auth required)
- `GET /users/hr-operations` - HR/Operations endpoint (Auth required)

**Documentation Status**: ✅ Fully documented with authentication examples

---

### 3. Company Module
**Tag**: `Companies`

**Endpoints**:
- `POST /companies` - Create new company
- `PUT /companies/:id` - Update company
- `GET /companies` - Get all companies (paginated, filtered)
- `GET /companies/:id` - Get company by ID
- `GET /companies/employee-count` - Get employee counts by company
- `GET /companies/:companyId/employees` - Get employees in company
- `DELETE /companies/:id` - Delete company
- `DELETE /companies` - Batch delete companies

**Documentation Status**: ✅ Fully documented

---

### 4. Employee Module
**Tag**: `Employees`

**Endpoints**:
- `POST /employees` - Create employee (with document uploads)
- `PATCH /employees/:id` - Update employee basic info
- `PATCH /employees/:id/contact-details` - Update contact details
- `PATCH /employees/:id/bank-details` - Update bank details
- `PATCH /employees/:id/additional-details` - Update additional details
- `PATCH /employees/:id/reference-details` - Update reference details
- `PATCH /employees/:id/document-uploads` - Update documents
- `POST /employees/:employeeId/employment-history` - Add employment history
- `PATCH /employees/:employeeId/employment-history/:id` - Update employment history
- `PUT /employees/:employeeId/employment-history/:id/leaving-date` - Update leaving date
- `GET /employees` - List employees (with filters, pagination)
- `GET /employees/:id` - Get employee by ID
- `DELETE /employees/:id` - Delete employee
- `DELETE /employees` - Batch delete employees

**Documentation Status**: ⚠️ Partially documented - Some endpoints need enhancement

---

### 5. Payroll Module
**Tag**: `Payroll`

**Endpoints**:
- `POST /payroll/calculate-payroll` - Calculate payroll for company
- `POST /payroll/finalize` - Finalize payroll
- `GET /payroll/employee-report/:employeeId` - Get employee payroll report
- `GET /payroll/report` - Get payroll report (paginated, filtered)
- `GET /payroll/by-month/:companyId/:payrollMonth` - Get payroll by month
- `GET /payroll/stats` - Get payroll statistics

**Documentation Status**: ✅ Fully documented with comprehensive query parameters

---

### 6. Departments Module
**Tag**: `Departments`

**Endpoints**:
- `POST /departments/user-department/:name` - Create user department
- `POST /departments/employee-department/:name` - Create employee department
- `GET /departments/user-departments` - Get all user departments
- `GET /departments/employee-departments` - Get all employee departments
- `DELETE /departments/user-department/:name` - Delete user department
- `DELETE /departments/employee-department/:name` - Delete employee department

**Documentation Status**: ✅ Fully documented

---

### 7. Designations Module
**Tag**: `Designations`

**Endpoints**:
- `POST /designations` - Create designation
- `GET /designations` - Get all designations
- `GET /designations/:id` - Get designation by ID
- `GET /designations/name/:name` - Get designation by name
- `DELETE /designations/:id` - Delete designation by ID
- `DELETE /designations/name/:name` - Delete designation by name

**Documentation Status**: ✅ Fully documented with examples

---

### 8. Dashboard Module
**Tag**: `Dashboard`

**Endpoints**:
- `GET /dashboard/report` - Get comprehensive dashboard statistics

**Documentation Status**: ✅ Fully documented

---

## Response Structures

### Standard Success Response
```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error Type",
  "errors": ["Detailed error messages"]
}
```

## Authentication

Most endpoints require JWT Bearer token authentication:

1. **Get Token**: Use `POST /users/login` to get access and refresh tokens
2. **Use Token**: Include in header: `Authorization: Bearer {accessToken}`
3. **Refresh Token**: Use `POST /users/refresh-token/:refreshToken` when access token expires

**Public Endpoints** (No authentication):
- `POST /users/register`
- `POST /users/login`
- `POST /users/forgot-password`
- `PUT /users/reset-password`
- `POST /users/refresh-token/:refreshToken`

## Export and Integration

### Export Swagger Documentation

**Method 1: Via NPM Script**
```bash
npm run swagger:export
```
Generates:
- `swagger.json` - OpenAPI JSON specification
- `swagger.yaml` - OpenAPI YAML specification (if js-yaml installed)

**Method 2: Via HTTP Endpoint**
```bash
curl http://localhost:3003/api-docs-json -o swagger.json
```

### Import into Tools

**Postman**:
1. Open Postman
2. Import → Link
3. Enter: `http://localhost:3003/api-docs-json`
4. Click "Continue" → "Import"

**Insomnia**:
1. Open Insomnia
2. Application → Preferences → Data
3. Import Data → From URL
4. Enter: `http://localhost:3003/api-docs-json`

**Swagger Editor/UI**:
- Import from URL: `http://localhost:3003/api-docs-json`
- Or import the exported JSON file

### Generate Client SDKs

**Using OpenAPI Generator**:
```bash
npm install -g @openapitools/openapi-generator-cli

# TypeScript/Axios
openapi-generator-cli generate \
  -i http://localhost:3003/api-docs-json \
  -g typescript-axios \
  -o ./generated-client

# JavaScript/Fetch
openapi-generator-cli generate \
  -i http://localhost:3003/api-docs-json \
  -g javascript \
  -o ./generated-client
```

## Documentation Features

### ✅ Implemented Features

1. **Comprehensive Endpoint Documentation**
   - All endpoints have detailed descriptions
   - Request/response examples
   - Parameter documentation with examples
   - Query parameter documentation

2. **Response Type Safety**
   - All responses use typed DTOs
   - Standard response wrapper structure
   - Error response types defined

3. **Validation Documentation**
   - Field-level validation rules visible
   - Format requirements documented
   - Min/max constraints shown

4. **Error Handling**
   - All possible error responses documented
   - Error examples provided
   - Status code meanings explained

5. **Authentication**
   - JWT Bearer auth configured
   - Protected endpoints marked
   - Token refresh flow documented

6. **File Upload**
   - Multipart form data support
   - File type and size constraints
   - Upload examples provided

### 📋 Documentation Standards

All endpoints follow these standards:
- `@ApiOperation` with summary and description
- `@ApiResponse` for all status codes with examples
- `@ApiParam` and `@ApiQuery` for parameters
- `@ApiBody` for request bodies
- `@ApiProperty` on all DTOs with examples
- Consistent error response structure

## Testing in Swagger UI

### Steps to Test an Endpoint:

1. **Open Swagger UI**: Navigate to `http://localhost:3003/api-docs`
2. **Find Endpoint**: Use search or navigate by tag
3. **Authorize** (if needed):
   - Click "Authorize" button
   - Enter: `Bearer {your-token}`
   - Click "Authorize"
4. **Try It Out**:
   - Click "Try it out"
   - Fill in parameters
   - Click "Execute"
5. **Review Response**:
   - Check status code
   - Review response body
   - Check response headers

## Best Practices

1. **Always Check Examples**: Each endpoint has request/response examples
2. **Validate Before Testing**: Review validation rules in parameter descriptions
3. **Use Correct Format**: Dates in `YYYY-MM` format, UUIDs for IDs
4. **Handle Errors**: Check error response examples for troubleshooting
5. **Test Authentication**: Ensure tokens are valid and not expired

## Maintenance

### Updating Documentation

Documentation is automatically generated from code:
- Add/update `@ApiProperty()` decorators on DTOs
- Add/update `@ApiOperation()` on controller methods
- Add `@ApiResponse()` for all status codes
- Restart server to see changes

### Version Control

Recommended workflow:
1. Export Swagger JSON before major releases
2. Commit to version control
3. Tag with version numbers
4. Share with frontend team

## Troubleshooting

### Swagger UI Not Loading
- Check server is running on correct port
- Verify `/api-docs` endpoint is accessible
- Check browser console for errors

### Missing Endpoints
- Ensure controller has `@ApiTags()` decorator
- Check DTOs have `@ApiProperty()` decorators
- Verify route paths are correct

### Export Fails
- Check Node.js version (16+ required)
- Verify ts-node is installed
- Check TypeScript compilation

## Support

For questions or issues:
- Review endpoint documentation in Swagger UI
- Check error messages for validation failures
- Export Swagger JSON for offline review
- Contact backend team for clarification

