import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar user={user} profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
