import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string | null;
  }

  interface Session {
    user?: User;
  }
}
