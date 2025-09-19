"use client";

import { useStytchMemberSession } from '@stytch/nextjs/b2b';

export default function OrganizationPage() {
  const { session } = useStytchMemberSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Overview</h1>
        <p className="text-gray-600">
          {session?.organization_id ?
            `Welcome to your organization` :
            'Manage your organization settings and members'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Members</h3>
          <p className="text-gray-600">Manage organization members and permissions</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Settings</h3>
          <p className="text-gray-600">Configure organization-wide settings</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Billing</h3>
          <p className="text-gray-600">View and manage billing information</p>
        </div>
      </div>
    </div>
  );
}