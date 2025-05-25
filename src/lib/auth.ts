import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const client = await pool.connect();
        try {
          const userRes = await client.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
          const user = userRes.rows[0];
          if (user && await bcrypt.compare(credentials.password, user.password)) {
            const businessRes = await client.query('SELECT name FROM businesses WHERE owner_id = $1', [user.id]);
            const business = businessRes.rows[0];
            return { 
              id: user.id.toString(), 
              name: user.full_name || user.email, 
              email: user.email,
              username: user.username,
              business_name: business?.name || 'Your Business'
            };
          }
          return null;
        } catch (err) {
          console.error('Auth error in authorize:', err);
          return null;
        } finally {
          client.release();
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.business_name = user.business_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.business_name = token.business_name;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }: { url: string; baseUrl: string; token?: any }) {
      if (url.startsWith('/') && token?.id) return `${baseUrl}${url}`;
      if (token?.id) return `${baseUrl}/dashboard`;
      return `${baseUrl}/auth/signin`;
    },
  },
}; 