/**
 * app/api/auth/[...nextauth]/route.js
 * NextAuth API route — handles magic link callbacks
 */

import { handlers } from '../../../../lib/auth';

export const { GET, POST } = handlers;
