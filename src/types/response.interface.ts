export interface IResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
}
