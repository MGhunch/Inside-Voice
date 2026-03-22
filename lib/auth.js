/**
 * lib/auth.js
 * NextAuth v5 config — passcode-based sign in, role lookup via Airtable
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUserByEmail, getValidPasscode, markPasscodeUsed } from './airtable';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        code:  { type: 'text' },
      },
      async authorize({ email, code }) {
        const passcode = await getValidPasscode(email, code);
        if (!passcode) return null;

        await markPasscodeUsed(passcode.id);

        const user = await getUserByEmail(email);
        if (!user) return null;

        return { email: user.email, name: user.name, access: user.access };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      // user is only present on first sign-in — persist role into the token
      if (user) {
        token.name   = user.name;
        token.access = user.access;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.name   = token.name;
      session.user.access = token.access;
      return session;
    },
  },

  pages: {
    signIn: '/',
    error:  '/',
  },
});
