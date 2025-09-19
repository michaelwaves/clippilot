"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  CheckSquare,
  Palette,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface SidebarProps {
  user: User
  profile: any
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Campaigns",
    href: "/dashboard/campaigns",
    icon: FileText,
  },
  {
    name: "Templates",
    href: "/dashboard/templates",
    icon: MessageSquare,
  },
  {
    name: "Assets",
    href: "/dashboard/assets",
    icon: Palette,
  },
  {
    name: "Approvals",
    href: "/dashboard/approvals",
    icon: CheckSquare,
    roles: ["compliance", "manager"],
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Teams",
    href: "/dashboard/teams",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(profile?.role)
  })

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">CampaignHub</h1>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
