import { $Enums } from '@prisma/client';
import {
  Category,
  EducationQualification,
  Gender,
  Status,
  Title,
} from '../enum/employee.enum';

export interface IEmployee {
  id?: string;
  title?: Title | $Enums.Title;
  firstName?: string;
  lastName?: string;
  designationName?: string;
  designationId?: string;
  employeeDepartmentId?: string;
  employeeDepartmentName?: string;
  mobileNumber?: string;
  companyName?: string;
  currentCompanyId?: string;
  currentCompanyDesignationId?: string;
  currentCompanyDepartmentId?: string;
  currentCompanySalary?: number;
  currentCompanyJoiningDate?: string;
  currentCompanyName?: string;
  currentCompanyEmployeeDepartmentName?: string;
  currentCompanyEmployeeDesignationName?: string;
  status?: Status | $Enums.Status;
  recruitedBy?: string;
  gender?: Gender | $Enums.Gender;
  fatherName?: string;
  motherName?: string;
  husbandName?: string | null;
  category?: Category | $Enums.Category;
  dateOfBirth?: string;
  age?: number;
  employeeOnboardingDate?: string;
  highestEducationQualification?: EducationQualification;
  bloodGroup?: string;
  permanentAddress?: string;
  presentAddress?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: number;
  referenceName?: string;
  referenceAddress?: string;
  referenceNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankCity?: string;
  bankName?: string;
  pfUanNumber?: string;
  esicNumber?: string;
  policeVerificationNumber?: string;
  policeVerificationDate?: string;
  trainingCertificateNumber?: string;
  trainingCertificateDate?: string;
  medicalCertificateNumber?: string;
  medicalCertificateDate?: string;
  photo?: string;
  aadhaar?: string;
  panCard?: string;
  bankPassbook?: string;
  markSheet?: string;
  otherDocument?: string;
  otherDocumentRemarks?: string;
  salary?: number;
  aadhaarNumber?: string;
}
