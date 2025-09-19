import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, FileText, User, Calendar } from "lucide-react"
import Link from "next/link"
import { ApprovalActions } from "@/components/approvals/approval-actions"

export default async function ApprovalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile to check role
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  // Only compliance managers and managers can access this page
  if (!profile || !["compliance", "manager"].includes(profile.role)) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-muted-foreground text-center">
              You don't have permission to access the approval dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get campaigns pending approval
  const { data: pendingCampaigns } = await supabase
    .from("campaigns")
    .select(`
      *,
      teams(name),
      users!campaigns_created_by_fkey(name),
      campaign_versions(
        id,
        version_number,
        generated_content_url,
        created_at
      )
    `)
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false })

  // Get recent approvals
  const { data: recentApprovals } = await supabase
    .from("approvals")
    .select(`
      *,
      campaign_versions(
        campaign_id,
        version_number,
        campaigns(name, teams(name))
      ),
      users!approvals_reviewer_id_fkey(name)
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get approval stats
  const { count: totalPending } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_approval")

  const { count: approvedToday } = await supabase
    .from("approvals")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
    .gte("created_at", new Date().toISOString().split("T")[0])

  const { count: rejectedToday } = await supabase
    .from("approvals")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected")
    .gte("created_at", new Date().toISOString().split("T")[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Approval Dashboard</h1>
        <p className="text-muted-foreground">Review and approve marketing campaigns</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedToday || 0}</div>
            <p className="text-xs text-muted-foreground">Campaigns approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedToday || 0}</div>
            <p className="text-xs text-muted-foreground">Campaigns rejected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="history">Approval History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingCampaigns && pendingCampaigns.length > 0 ? (
            <div className="grid gap-4">
              {pendingCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          Created by {campaign.users?.name}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <FileText className="h-4 w-4 mr-2" />
                          Team: {campaign.teams?.name}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <FileText className="h-4 w-4 mr-2" />
                          {campaign.campaign_versions?.length || 0} versions
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <Link href={`/dashboard/campaigns/${campaign.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        <ApprovalActions campaignId={campaign.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending approvals</h3>
                <p className="text-muted-foreground text-center">All campaigns are up to date!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {recentApprovals && recentApprovals.length > 0 ? (
            <div className="space-y-4">
              {recentApprovals.map((approval) => (
                <Card key={approval.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{approval.campaign_versions?.campaigns?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Version {approval.campaign_versions?.version_number} •{" "}
                          {approval.campaign_versions?.campaigns?.teams?.name}
                        </p>
                        {approval.comments && (
                          <p className="text-sm text-muted-foreground italic">"{approval.comments}"</p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          className={
                            approval.status === "approved"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {approval.status === "approved" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {approval.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          by {approval.users?.name} • {new Date(approval.created_at).toLocaleDateString()}
                        </p>
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
                <h3 className="text-lg font-medium mb-2">No approval history</h3>
                <p className="text-muted-foreground text-center">Approval history will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
