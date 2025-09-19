// src/components/LoginOrSignupDiscoveryForm.jsx
import { StytchB2B } from '@stytch/nextjs/b2b';
import { discoveryConfig } from '@/lib/stytchConfig';

export const LoginOrSignupDiscoveryForm = () => {
    return <StytchB2B config={discoveryConfig} />;
};