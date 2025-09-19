import { createStytchB2BClient } from '@stytch/nextjs/b2b';

export function createStytchServerClient() {
  return createStytchB2BClient({
    project_id: process.env.STYTCH_PROJECT_ID!,
    secret: process.env.STYTCH_SECRET!,
  });
}