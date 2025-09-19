"use client";

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assets</h1>
        <p className="text-gray-600">Manage your media library, templates, and brand assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Media Library</h3>
          <p className="text-gray-600 mb-4">Store and organize your images, videos, and other media files</p>
          <div className="text-sm text-gray-500">0 files</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Templates</h3>
          <p className="text-gray-600 mb-4">Pre-built campaign templates to get started quickly</p>
          <div className="text-sm text-gray-500">3 templates</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Brand Kit</h3>
          <p className="text-gray-600 mb-4">Your brand colors, fonts, and logo assets</p>
          <div className="text-sm text-gray-500">Not configured</div>
        </div>
      </div>
    </div>
  );
}