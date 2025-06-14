// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

// Define authOptions separately so it can be exported and used by getServerSession
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // **IMPORTANT:** In a real application, you would securely
        // hash the password and compare the hash here.
        // Storing plain passwords in env vars is NOT recommended for production.
        // For this example, we'll use plain text from env vars for simplicity.

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          credentials?.username === adminUsername &&
          credentials?.password === adminPassword
        ) {
          // If credentials are valid, return a user object.
          // This object will be available in the session.
          // You can add more user properties here if needed (e.g., roles).
          return { id: 'admin', name: 'Admin User' };
        } else {
          // If credentials are not valid, return null.
          return null;
        }
      },
    }),
  ],
  // Optional: Add callbacks for JWT and Session if you need custom data
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User | null;
    }): Promise<JWT> {
      // Type parameters      // Add user data to the token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (session.user && token.id) {
        // NextAuth's default Session type might not have 'id' on user.
        // You might need to augment the Session type or cast.
        (session.user as any).id = token.id;
        // session.user.name = token.name as string | null | undefined;
        // session.user.email = token.email as string | null | undefined;
      }
      return session;
    },
  },
  // Configure the login page URL
  pages: {
    signIn: '/admin/login', // Redirect unauthenticated users to this page
  },
  // A secret is required for signing and encrypting the JWT
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
