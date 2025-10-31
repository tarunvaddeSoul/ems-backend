import { ApiProperty } from '@nestjs/swagger';

class CompanyReportDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() address: string;
}
class TotalsDto {
  @ApiProperty() totalEmployees: number;
  @ApiProperty() totalPresent: number;
  @ApiProperty() averageAttendance: number;
  @ApiProperty() minPresent: number;
  @ApiProperty() maxPresent: number;
}
class AttendanceRecordReportDto {
  @ApiProperty() employeeId: string;
  @ApiProperty() employeeName: string;
  @ApiProperty() employeeID: string;
  @ApiProperty() departmentName: string;
  @ApiProperty() designationName: string;
  @ApiProperty() presentCount: number;
}
class AttendanceSheetMinimalDto {
  @ApiProperty() id: string;
  @ApiProperty() attendanceSheetUrl: string;
}
export class AttendanceReportResponseDto {
  @ApiProperty({ type: CompanyReportDto })
  company: CompanyReportDto;

  @ApiProperty({ type: String })
  month: string;

  @ApiProperty({ type: TotalsDto })
  totals: TotalsDto;

  @ApiProperty({ type: [AttendanceRecordReportDto] })
  records: AttendanceRecordReportDto[];

  @ApiProperty({ type: AttendanceSheetMinimalDto, nullable: true })
  attendanceSheet: AttendanceSheetMinimalDto | null;
}
