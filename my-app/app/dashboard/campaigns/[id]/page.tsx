import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, User, Calendar, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CampaignStatusActions } from "@/components/campaigns/campaign-status-actions"

interface CampaignPageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get campaign details
  const { data: campaign } = await supabase
    .from("campaigns")
    .select(`
      *,
      teams(name),
      users!campaigns_created_by_fkey(name),
      campaign_versions(
        id,
        version_number,
        generated_content_url,
        ai_metadata,
        created_at,
        prompt_templates(name, description)
      )
    `)
    .eq("id", id)
    .single()

  if (!campaign) {
    notFound()
  }

  // Get approvals for this campaign
  const { data: approvals } = await supabase
    .from("approvals")
    .select(`
      *,
      users!approvals_reviewer_id_fkey(name),
      campaign_versions(version_number)
    `)
    .in(
      "campaign_version_id",
      campaign.campaign_versions.map((v: any) => v.id),
    )
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
      <div className="flex items-center gap-4">
        <Link href="/dashboard/campaigns">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-balance">{campaign.name}</h1>
            <Badge className={getStatusColor(campaign.status)}>{campaign.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-muted-foreground">{campaign.description}</p>
        </div>
        <CampaignStatusActions campaign={campaign} />
      </div>

      {/* Campaign Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created By</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{campaign.users?.name}</div>
            <p className="text-xs text-muted-foreground">Campaign creator</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{campaign.teams?.name}</div>
            <p className="text-xs text-muted-foreground">Team workspace</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{new Date(campaign.created_at).toLocaleDateString()}</div>
            <p className="text-xs text-muted-foreground">Campaign date</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="versions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="space-y-4">
          {campaign.campaign_versions && campaign.campaign_versions.length > 0 ? (
            <div className="space-y-4">
              {campaign.campaign_versions.map((version: any) => (
                <Card key={version.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Version {version.version_number}</CardTitle>
                        {version.prompt_templates && (
                          <CardDescription>Template: {version.prompt_templates.name}</CardDescription>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(version.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {version.generated_content_url ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Generated Content:</p>
                        <div className="p-4 bg-muted rounded-lg">
                          <a
                            href={version.generated_content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Generated Content
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No content generated yet</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No versions yet</h3>
                <p className="text-muted-foreground text-center">Campaign versions will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          {approvals && approvals.length > 0 ? (
            <div className="space-y-4">
              {approvals.map((approval: any) => (
                <Card key={approval.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {approval.status === "approved" ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="font-medium capitalize">{approval.status}</span>
                          <span className="text-sm text-muted-foreground">
                            by {approval.users?.name} • Version {approval.campaign_versions?.version_number}
                          </span>
                        </div>
                        {approval.comments && (
                          <div className="pl-6">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm text-muted-foreground italic">"{approval.comments}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(approval.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No approvals yet</h3>
                <p className="text-muted-foreground text-center">Approval history will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
