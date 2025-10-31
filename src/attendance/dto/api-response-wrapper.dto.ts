import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseWrapperDto<T> {
  @ApiProperty({
    type: 'number',
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    type: 'string',
    example: 'Operation successful',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;
}

export class ApiErrorResponseDto {
  @ApiProperty({
    type: 'number',
    example: 400,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    type: 'string',
    example: 'Validation failed',
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    type: 'string',
    example: 'Bad Request',
    description: 'Error type',
    required: false,
  })
  error?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['Field is required', 'Invalid format'],
    description: 'Array of error messages',
    required: false,
  })
  errors?: string[];
}

