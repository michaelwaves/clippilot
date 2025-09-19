"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStytchMember } from '@stytch/nextjs/b2b';
import { StytchB2B } from '@stytch/nextjs/b2b';
import { AuthFlowType, B2BProducts } from '@stytch/vanilla-js/b2b';

export default function AuthenticatePage() {
  const { member, isInitialized } = useStytchMember();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && member) {
      router.replace("/dashboard");
    }
  }, [member, isInitialized, router]);

  if (isInitialized && member) {
    return null; // Redirecting
  }

  const config = {
    products: [B2BProducts.emailMagicLinks, B2BProducts.passwords],
    sessionOptions: { sessionDurationMinutes: 60 },
    authFlowType: AuthFlowType.Discovery,
    emailMagicLinksOptions: {
      discoveryRedirectURL: typeof window !== 'undefined' ? `${window.location.origin}/authenticate` : '/authenticate',
    },
    passwordOptions: {
      loginRedirectURL: typeof window !== 'undefined' ? `${window.location.origin}/authenticate` : '/authenticate',
      signupRedirectURL: typeof window !== 'undefined' ? `${window.location.origin}/authenticate` : '/authenticate',
    },
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to ClipPilot</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to manage your marketing campaigns
          </p>
        </div>
        <StytchB2B config={config} />
      </div>
    </div>
  );
}