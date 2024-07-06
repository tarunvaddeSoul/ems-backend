import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { PresentDaysCount, PFOptions, ESICOptions, BONUSOptions, LWFOptions } from '../enum/company.enum';
import { Transform } from 'class-transformer';


export class CreateCompanyDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  address: string;

  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  contactPersonName: string;

  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  contactPersonNumber: string;

  @ApiProperty({ required: true, enum: PresentDaysCount })
  @IsEnum(PresentDaysCount)
  presentDaysCount: PresentDaysCount = PresentDaysCount.D26;

  @ApiProperty({ required: true, enum: PFOptions, default: PFOptions.NO })
  @IsEnum(PFOptions)
  PF: PFOptions;

  @ApiProperty({ required: true, enum: ESICOptions, default: ESICOptions.NO })
  @IsEnum(ESICOptions)
  ESIC: ESICOptions = ESICOptions.NO;

  @ApiProperty({ required: true, enum: BONUSOptions, default: BONUSOptions.NO })
  @IsEnum(BONUSOptions)
  BONUS: BONUSOptions = BONUSOptions.NO;

  @ApiProperty({ required: true, enum: LWFOptions, default: LWFOptions.NO })
  @IsEnum(LWFOptions)
  LWF: LWFOptions = LWFOptions.NO;

  @ApiProperty({ required: true })
  @IsInt()
  @Min(0)
  otherAllowance: number;

  @ApiProperty({ required: false })
  @Transform(({ value }) => value?.toUpperCase())
  @IsOptional()
  @IsString()
  otherAllowanceRemark?: string;
}
