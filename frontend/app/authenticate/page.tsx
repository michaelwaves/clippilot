'use client'
// pages/authenticate.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStytchMember } from '@stytch/nextjs/b2b';
import { LoginOrSignupDiscoveryForm } from "@/components/LoginOrSignupDiscovery";

export default function Authenticate() {
    const { member, isInitialized } = useStytchMember();
    const router = useRouter();

    useEffect(() => {
        if (isInitialized && member) {
            // Redirect the user to an authenticated page if they are already logged in
            router.replace("/dashboard");
        }
    }, [member, isInitialized, router]);

    return <LoginOrSignupDiscoveryForm />;
}