import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, CheckCircle, Clock, TrendingUp, ExternalLink } from "lucide-react"
import Link from "next/link"
import { DeploymentActions } from "@/components/deployment/deployment-actions"

export default async function DeploymentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get approved campaigns ready for deployment
  const { data: readyForDeployment } = await supabase
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
    .eq("status", "approved")
    .order("updated_at", { ascending: false })

  // Get deployed campaigns with posts
  const { data: deployedCampaigns } = await supabase
    .from("campaigns")
    .select(`
      *,
      teams(name),
      campaign_versions(
        id,
        posts(
          id,
          platform,
          external_post_id,
          published_at,
          created_at
        )
      )
    `)
    .eq("status", "published")
    .order("updated_at", { ascending: false })

  // Get deployment stats
  const { count: readyCount } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  const { count: publishedCount } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")

  const { count: totalPosts } = await supabase.from("posts").select("*", { count: "exact", head: true })

  const { count: postsToday } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .gte("published_at", new Date().toISOString().split("T")[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Social Media Deployment</h1>
        <p className="text-muted-foreground">Deploy approved campaigns to social media platforms</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Deploy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyCount || 0}</div>
            <p className="text-xs text-muted-foreground">Approved campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount || 0}</div>
            <p className="text-xs text-muted-foreground">Live campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">All platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postsToday || 0}</div>
            <p className="text-xs text-muted-foreground">Published today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ready" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ready">Ready to Deploy</TabsTrigger>
          <TabsTrigger value="deployed">Deployed Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="ready" className="space-y-4">
          {readyForDeployment && readyForDeployment.length > 0 ? (
            <div className="grid gap-4">
              {readyForDeployment.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-muted-foreground">Team: {campaign.teams?.name}</div>
                        <div className="text-muted-foreground">Created by: {campaign.users?.name}</div>
                        <div className="text-muted-foreground">Versions: {campaign.campaign_versions?.length || 0}</div>
                        <div className="text-muted-foreground">
                          Updated: {new Date(campaign.updated_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <Link href={`/dashboard/campaigns/${campaign.id}`}>
                          <Button variant="outline">View Campaign</Button>
                        </Link>
                        <DeploymentActions campaign={campaign} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No campaigns ready</h3>
                <p className="text-muted-foreground text-center">
                  Approved campaigns will appear here ready for deployment
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deployed" className="space-y-4">
          {deployedCampaigns && deployedCampaigns.length > 0 ? (
            <div className="space-y-4">
              {deployedCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription>{campaign.teams?.name}</CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Share2 className="h-3 w-3 mr-1" />
                        Published
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaign.campaign_versions?.map((version: any) =>
                        version.posts?.map((post: any) => (
                          <div key={post.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Share2 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium capitalize">{post.platform}</p>
                                <p className="text-sm text-muted-foreground">
                                  Published {new Date(post.published_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {post.external_post_id && (
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Post
                              </Button>
                            )}
                          </div>
                        )),
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No deployed campaigns</h3>
                <p className="text-muted-foreground text-center">Published campaigns will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
