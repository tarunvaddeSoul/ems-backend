import { ApiProperty } from '@nestjs/swagger';

export class GetEmployeesResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  designation: string;

  @ApiProperty()
  department: string;

  @ApiProperty()
  salary: number;

  @ApiProperty()
  joiningDate: string;

  @ApiProperty()
  leavingDate: string | null;
}
