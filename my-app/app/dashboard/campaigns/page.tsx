import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Calendar, User } from "lucide-react"
import Link from "next/link"

export default async function CampaignsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get all campaigns for user's teams
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(`
      *,
      teams(name),
      users!campaigns_created_by_fkey(name),
      campaign_versions(count)
    `)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-primary/10 text-primary border-primary/20"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending_approval":
        return "bg-secondary/10 text-secondary-foreground border-secondary/20"
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your marketing campaigns</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>{campaign.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {campaign.users?.name}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    {campaign.teams?.name}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      {campaign.campaign_versions?.length || 0} versions
                    </span>
                    <Link href={`/dashboard/campaigns/${campaign.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first marketing campaign to start generating content with AI assistance
            </p>
            <Link href="/dashboard/campaigns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
