import 'express';
import { EAuthRole } from 'src/auth/auth.types';

declare module 'express' {
  interface User {
    id: string;
    email: string;
    role: EAuthRole;
  }

  interface Request {
    user?: User;
  }
}
