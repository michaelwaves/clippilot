import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Eye, Heart, Share, MessageCircle } from "lucide-react"
import { PerformanceChart } from "@/components/analytics/performance-chart"
import { PlatformBreakdown } from "@/components/analytics/platform-breakdown"
import { CampaignMetrics } from "@/components/analytics/campaign-metrics"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get published campaigns with posts and KPIs
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(`
      *,
      teams(name),
      campaign_versions(
        posts(
          id,
          platform,
          published_at,
          kpis(
            metric_name,
            metric_value,
            scraped_at
          )
        )
      )
    `)
    .eq("status", "published")
    .order("updated_at", { ascending: false })

  // Calculate aggregate metrics
  const allPosts = campaigns?.flatMap((c) => c.campaign_versions?.flatMap((v) => v.posts || []) || []) || []
  const allKpis = allPosts.flatMap((p) => p.kpis || [])

  const totalViews = allKpis.filter((k) => k.metric_name === "views").reduce((sum, k) => sum + k.metric_value, 0)
  const totalLikes = allKpis.filter((k) => k.metric_name === "likes").reduce((sum, k) => sum + k.metric_value, 0)
  const totalShares = allKpis.filter((k) => k.metric_name === "shares").reduce((sum, k) => sum + k.metric_value, 0)
  const totalComments = allKpis.filter((k) => k.metric_name === "comments").reduce((sum, k) => sum + k.metric_value, 0)

  // Platform breakdown
  const platformStats = allPosts.reduce(
    (acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Recent performance data for charts
  const recentKpis = allKpis
    .filter((k) => k.metric_name === "views")
    .sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime())
    .slice(0, 30)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track campaign performance and engagement metrics</p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Engagement metric</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Viral reach</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Community engagement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="platforms">Platform Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Views over time across all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceChart data={recentKpis} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Posts by social media platform</CardDescription>
              </CardHeader>
              <CardContent>
                <PlatformBreakdown data={platformStats} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignMetrics campaigns={campaigns || []} />
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(platformStats).map(([platform, count]) => (
              <Card key={platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{platform}</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">Published posts</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
