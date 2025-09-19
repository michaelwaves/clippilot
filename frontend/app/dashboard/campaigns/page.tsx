"use client";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-gray-600">Create and manage your marketing campaigns</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium">Summer Sale Campaign</h4>
            <p className="text-sm text-gray-600">Active • Created 2 days ago</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-medium">Product Launch</h4>
            <p className="text-sm text-gray-600">Draft • Created 1 week ago</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium">Newsletter Campaign</h4>
            <p className="text-sm text-gray-600">Scheduled • Created 2 weeks ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}