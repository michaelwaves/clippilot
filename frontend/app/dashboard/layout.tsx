"use client";

import Navbar from "@/components/GlobalNavBar";
import { Building2, Target, Palette, Users, VideoIcon, Clipboard, BarChart } from "lucide-react";

const navigationSections = [
  {
    title: "Organization",
    links: [
      {
        title: "Members",
        href: "/members",
        icon: <Users size={18} />,
      },
    ],
  },
  {
    title: "Campaigns",
    links: [
      {
        title: "Campaigns",
        href: "/campaigns",
        icon: <Target size={18} />,
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: <BarChart size={18} />,
      },
    ],
  },
  {
    title: "Assets",
    links: [
      {
        title: "Media Library",
        href: "/assets",
        icon: <VideoIcon size={18} />,
      },
      {
        title: "Templates",
        href: "/assets/templates",
        icon: <Clipboard size={18} />,
      },
      {
        title: "Brand Kit",
        href: "/assets/brand",
        icon: <Palette size={18} />,
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar sections={navigationSections} />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}