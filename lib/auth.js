/**
 * lib/auth.js
 * NextAuth v5 config — magic links via Resend, role lookup via Airtable
 */

import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { getUserByEmail } from './airtable';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'Inside Voice <noreply@insidevoice.co.nz>',
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const record = await getUserByEmail(user.email);
      return record !== null;
    },

    async jwt({ token, user }) {
      if (user) {
        const record = await getUserByEmail(user.email);
        if (record) {
          token.name = record.name;
          token.access = record.access;
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.name = token.name;
      session.user.access = token.access;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    verifyRequest: '/check-email',
    error: '/login',
  },
});
