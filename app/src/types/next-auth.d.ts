
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
      plan: string;
    };
  }

  interface User {
    role: string;
    plan: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    plan: string;
  }
}
