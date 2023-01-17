export interface JWT {
  id: string;
  username: string;
  password: string;
  iat: number;
  exp: number;
}