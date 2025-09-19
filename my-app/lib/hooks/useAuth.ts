"use client";

import { useStytchMember, useStytchB2BClient } from '@stytch/nextjs/b2b';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name?: string;
  stytch_member_id?: string;
  organization_id?: string;
}

export function useAuth() {
  const { member, organization, isInitialized } = useStytchMember();
  const stytch = useStytchB2BClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (member && organization) {
        setUser({
          id: member.member_id,
          email: member.email_address,
          name: member.name,
          stytch_member_id: member.member_id,
          organization_id: organization.organization_id,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [member, organization, isInitialized]);

  const signOut = async () => {
    try {
      await stytch.session.revoke();
      setUser(null);
      router.push('/authenticate');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    organization,
    member,
    loading: loading || !isInitialized,
    signOut,
    isAuthenticated: !!user,
  };
}