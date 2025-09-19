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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Share2, Loader2, Linkedin, Youtube, Instagram } from "lucide-react"
import { useRouter } from "next/navigation"

interface DeploymentActionsProps {
  campaign: any
}

const platforms = [
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600" },
  { id: "tiktok", name: "TikTok", icon: Share2, color: "text-black" },
]

export function DeploymentActions({ campaign }: DeploymentActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [postContent, setPostContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId],
    )
  }

  const handleDeploy = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get the latest campaign version
      const { data: latestVersion } = await supabase
        .from("campaign_versions")
        .select("id")
        .eq("campaign_id", campaign.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single()

      if (!latestVersion) throw new Error("No campaign version found")

      // Create posts for each selected platform
      const posts = selectedPlatforms.map((platform) => ({
        campaign_version_id: latestVersion.id,
        platform,
        external_post_id: `mock_${platform}_${Date.now()}`, // In real app, this would come from API
        published_at: new Date().toISOString(),
      }))

      const { error: postsError } = await supabase.from("posts").insert(posts)

      if (postsError) throw postsError

      // Update campaign status to published
      const { error: campaignError } = await supabase
        .from("campaigns")
        .update({ status: "published", updated_at: new Date().toISOString() })
        .eq("id", campaign.id)

      if (campaignError) throw campaignError

      toast({
        title: "Success",
        description: `Campaign deployed to ${selectedPlatforms.length} platform(s)`,
      })

      // Reset form and close dialog
      setSelectedPlatforms([])
      setPostContent("")
      setIsOpen(false)

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error deploying campaign:", error)
      toast({
        title: "Error",
        description: "Failed to deploy campaign",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Share2 className="h-4 w-4 mr-2" />
          Deploy to Social Media
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deploy Campaign</DialogTitle>
          <DialogDescription>Select platforms to publish your approved campaign content</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Select Platforms</Label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon
                return (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
                    />
                    <Label htmlFor={platform.id} className="flex items-center gap-2 cursor-pointer">
                      <Icon className={`h-4 w-4 ${platform.color}`} />
                      {platform.name}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-content">Post Content (Optional)</Label>
            <Textarea
              id="post-content"
              placeholder="Add custom caption or description for the posts..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={3}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This will publish your campaign content to the selected platforms immediately. Make
              sure you have reviewed and approved all content.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleDeploy} disabled={isLoading || selectedPlatforms.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deploy Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
