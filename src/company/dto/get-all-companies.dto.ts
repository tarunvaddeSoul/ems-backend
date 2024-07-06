import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetAllCompaniesDto {
  @ApiProperty({ required: false, description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Number of items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Field to sort by', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, enum: SortOrder, description: 'Sort order', default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiProperty({ required: false, description: 'Text to search by (company name or address)' })
  @IsOptional()
  @IsString()
  searchText?: string;
}
