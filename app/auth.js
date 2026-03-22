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
    /**
     * Called when a user tries to sign in.
     * Reject anyone whose email isn't in Airtable.
     */
    async signIn({ user }) {
      const record = await getUserByEmail(user.email);
      return record !== null; // false = reject, true = allow
    },

    /**
     * Called when a JWT is created (sign in) or updated.
     * Bake the user's name and access level into the token.
     */
    async jwt({ token, user }) {
      if (user) {
        // First sign in — fetch from Airtable and store in token
        const record = await getUserByEmail(user.email);
        if (record) {
          token.name = record.name;
          token.access = record.access;
        }
      }
      return token;
    },

    /**
     * Called whenever a session is checked.
     * Expose name and access to the client.
     */
    async session({ session, token }) {
      session.user.name = token.name;
      session.user.access = token.access;
      return session;
    },
  },

  pages: {
    signIn: '/login',      // our custom login page
    verifyRequest: '/check-email', // "check your email" page
    error: '/login',       // send auth errors back to login
  },
});
