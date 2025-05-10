import 'express';

declare module 'express' {
  interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'CLIENT';
  }

  interface Request {
    user?: User;
  }
}
