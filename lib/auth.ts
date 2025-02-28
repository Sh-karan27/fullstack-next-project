import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

interface CustomUser {
  id: string;
  email: string;
  username: string;
  avatar: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        username: { label: 'Username', type: 'text' },
        avatar: { label: 'Avatar', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email });
          // console.log(user, 'auth');

          if (!user) {
            throw new Error('No user found');
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            avatar: user.avatar,
          };
        } catch (error) {
          throw new Error('Failed to authenticate');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser; // ✅ Type assertion to access username
        token.id = customUser.id;
        token.email = customUser.email;
        token.username = customUser.username;
        token.avatar = customUser.avatar;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatar = token.avatar as string;
      }

      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
