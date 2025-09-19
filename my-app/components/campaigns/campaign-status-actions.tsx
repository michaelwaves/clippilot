"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Send, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CampaignStatusActionsProps {
  campaign: any
}

export function CampaignStatusActions({ campaign }: CampaignStatusActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", campaign.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Campaign status updated to ${newStatus.replace("_", " ")}`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating campaign status:", error)
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmitForApproval = campaign.status === "draft"
  const canPublish = campaign.status === "approved"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canSubmitForApproval && (
          <DropdownMenuItem onClick={() => handleStatusChange("pending_approval")}>
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </DropdownMenuItem>
        )}
        {canPublish && (
          <DropdownMenuItem onClick={() => handleStatusChange("published")}>
            <Send className="h-4 w-4 mr-2" />
            Publish Campaign
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
