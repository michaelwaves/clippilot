"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApprovalActionsProps {
  campaignId: string
}

export function ApprovalActions({ campaignId }: ApprovalActionsProps) {
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [comments, setComments] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleApproval = async (status: "approved" | "rejected") => {
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Get the latest campaign version
      const { data: latestVersion } = await supabase
        .from("campaign_versions")
        .select("id")
        .eq("campaign_id", campaignId)
        .order("version_number", { ascending: false })
        .limit(1)
        .single()

      if (!latestVersion) throw new Error("No campaign version found")

      // Create approval record
      const { error: approvalError } = await supabase.from("approvals").insert({
        campaign_version_id: latestVersion.id,
        reviewer_id: user.id,
        status,
        comments: comments.trim() || null,
      })

      if (approvalError) throw approvalError

      // Update campaign status
      const newStatus = status === "approved" ? "approved" : "rejected"
      const { error: campaignError } = await supabase
        .from("campaigns")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", campaignId)

      if (campaignError) throw campaignError

      toast({
        title: "Success",
        description: `Campaign ${status} successfully`,
      })

      // Reset form and close dialogs
      setComments("")
      setIsApproveOpen(false)
      setIsRejectOpen(false)

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error processing approval:", error)
      toast({
        title: "Error",
        description: `Failed to ${status === "approved" ? "approve" : "reject"} campaign`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this campaign? You can add optional comments below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approve-comments">Comments (Optional)</Label>
              <Textarea
                id="approve-comments"
                placeholder="Add any feedback or notes..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={() => handleApproval("approved")} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="destructive">
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Campaign</DialogTitle>
            <DialogDescription>
              Please provide feedback on why this campaign is being rejected. This will help the team improve future
              submissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-comments">Rejection Reason *</Label>
              <Textarea
                id="reject-comments"
                placeholder="Please explain why this campaign doesn't meet requirements..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleApproval("rejected")}
              disabled={isLoading || !comments.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
