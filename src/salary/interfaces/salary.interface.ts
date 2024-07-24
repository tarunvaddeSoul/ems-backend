export interface ISalary {
    employeeId?: string;
    companyId?: string;
    month?: string;
    monthlySalary?: number;
    dutyDone?: number;
    wagesPerDay?: number;
    basicPay?: number;
    epfWages?: any;
    bonus?: number;
    grossSalary?: number;
    pf?: number;
    esic?: number;
    advance?: number;
    uniform?: number;
    penalty?: number;
    lwf?: number;
    otherDeductions?: number;
    otherDeductionsRemark?: string;
    allowance?: number;
    allowanceRemark?: string;
    totalDeductions?: number;
    netSalary?: number;
}