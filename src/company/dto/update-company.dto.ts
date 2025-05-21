import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import {
  PresentDaysCount,
  PFOptions,
  ESICOptions,
  BONUSOptions,
  LWFOptions,
} from '../enum/company.enum';
import { Transform } from 'class-transformer';

export class UpdateCompanyDto {
  @ApiProperty({ required: false })
  @Transform(({ value }) => value?.toUpperCase())
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @Transform(({ value }) => value?.toUpperCase())
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ required: false })
  @Transform(({ value }) => value?.toUpperCase())
  @IsOptional()
  @IsString()
  contactPersonName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactPersonNumber: string;

  @ApiProperty({ required: false, enum: PresentDaysCount })
  @IsOptional()
  @IsEnum(PresentDaysCount)
  presentDaysCount: PresentDaysCount;

  @ApiProperty({ required: false, enum: PFOptions })
  @IsOptional()
  @IsEnum(PFOptions)
  PF: PFOptions;

  @ApiProperty({ required: false, enum: ESICOptions })
  @IsOptional()
  @IsEnum(ESICOptions)
  ESIC: ESICOptions;

  @ApiProperty({ required: false, enum: BONUSOptions })
  @IsOptional()
  @IsEnum(BONUSOptions)
  BONUS: BONUSOptions;

  @ApiProperty({ required: false, enum: LWFOptions })
  @IsOptional()
  @IsEnum(LWFOptions)
  LWF: LWFOptions;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Min(0)
  otherAllowance: number;

  @ApiProperty({ required: false })
  @Transform(({ value }) => value?.toUpperCase())
  @IsOptional()
  @IsString()
  otherAllowanceRemark?: string;
}
