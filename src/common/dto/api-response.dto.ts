import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API Response Wrapper
 * Used for consistent response structure across all endpoints
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({
    type: 'number',
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    type: 'string',
    example: 'Operation successful',
    description: 'Human-readable response message',
  })
  message: string;

  @ApiProperty({
    description: 'Response payload data',
    required: false,
  })
  data?: T;
}

/**
 * Standard Error Response
 */
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
    description: 'Error type/category',
    required: false,
  })
  error?: string;

  @ApiProperty({
    type: [String],
    example: ['Field is required', 'Invalid format'],
    description: 'Array of detailed error messages',
    required: false,
  })
  errors?: string[];
}
