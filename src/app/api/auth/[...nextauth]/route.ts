// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/shared/authOptions';

// Define authOptions separately so it can be exported and used by getServerSession

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
