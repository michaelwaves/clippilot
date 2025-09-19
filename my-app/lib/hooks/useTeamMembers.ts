"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface TeamMember {
  member_id: string;
  email_address: string;
  name?: string;
  roles?: string[];
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, organization } = useAuth();

  const fetchMembers = async () => {
    if (!user || !organization) return;

    try {
      setLoading(true);
      const response = await fetch('/api/auth/members');

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data.members || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (email: string, roles: string[] = ['member']) => {
    try {
      const response = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          organization_id: organization?.organization_id,
          untrusted_metadata: { roles },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite member');
      }

      const result = await response.json();

      // Refresh members list
      await fetchMembers();

      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateMemberRoles = async (memberId: string, roles: string[]) => {
    try {
      const response = await fetch('/api/auth/members', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: memberId,
          roles,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update member roles');
      }

      const result = await response.json();

      // Refresh members list
      await fetchMembers();

      return result;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (user && organization) {
      fetchMembers();
    }
  }, [user, organization]);

  return {
    members,
    loading,
    error,
    inviteMember,
    updateMemberRoles,
    refetch: fetchMembers,
  };
}