import { createStytchB2BUIClient } from '@stytch/nextjs/b2b/ui';
export function createStytchServerClient() {
  return createStytchB2BUIClient({
    project_id: process.env.STYTCH_PROJECT_ID!,
    secret: process.env.STYTCH_SECRET!,
  });
}