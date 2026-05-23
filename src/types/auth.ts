import { Request } from 'express';

export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: 'contributor' | 'maintainer';
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
