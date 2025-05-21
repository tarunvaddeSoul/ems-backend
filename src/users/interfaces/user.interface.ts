import { User } from '@prisma/client';

export interface IUser {
  user: Omit<User, 'password'>;
  tokens: ITokens;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginResponse {
  user: User;
  tokens: ITokens;
}

export interface IRegisterResponse {
  user: User;
  tokens: ITokens;
}
