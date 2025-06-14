export enum PresentDaysCount {
  D26 = '26',
  D27 = '27',
  D28 = '28',
  D29 = '29',
  D30 = '30',
  D31 = '31',
}

export enum PFOptions {
  TWELVE_PERCENT = '12%',
  NO = 'NO',
}

export enum ESICOptions {
  ZERO_POINT_SEVEN_FIVE_PERCENT = '0.75%',
  NO = 'NO',
}

export enum BONUSOptions {
  EIGHT_POINT_THREE_THREE_PERCENT = '8.33%',
  NO = 'NO',
}

export enum LWFOptions {
  TEN_RUPEES = '10 RUPEES',
  NO = 'NO',
}

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum SalaryFieldCategory {
  MANDATORY_NO_RULES = 'MANDATORY_NO_RULES',
  MANDATORY_WITH_RULES = 'MANDATORY_WITH_RULES',
  OPTIONAL_NO_RULES = 'OPTIONAL_NO_RULES',
  OPTIONAL_WITH_RULES = 'OPTIONAL_WITH_RULES',
  CUSTOM = 'CUSTOM',
}

export enum SalaryFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
}

export enum SalaryFieldPurpose {
  ALLOWANCE = 'ALLOWANCE',
  DEDUCTION = 'DEDUCTION',
  INFORMATION = 'INFORMATION',
  CALCULATION = 'CALCULATION',
}

export enum SalaryPaidStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  HOLD = 'HOLD',
}
