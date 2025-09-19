"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Eye, Heart, Share, MessageCircle, TrendingUp } from "lucide-react"

interface CampaignMetricsProps {
  campaigns: Array<{
    id: string
    name: string
    teams: { name: string }
    campaign_versions: Array<{
      posts: Array<{
        platform: string
        kpis: Array<{
          metric_name: string
          metric_value: number
        }>
      }>
    }>
  }>
}

export function CampaignMetrics({ campaigns }: CampaignMetricsProps) {
  const getCampaignMetrics = (campaign: any) => {
    const allKpis =
      campaign.campaign_versions?.flatMap((v: any) => v.posts?.flatMap((p: any) => p.kpis || []) || []) || []

    return {
      views: allKpis
        .filter((k: any) => k.metric_name === "views")
        .reduce((sum: number, k: any) => sum + k.metric_value, 0),
      likes: allKpis
        .filter((k: any) => k.metric_name === "likes")
        .reduce((sum: number, k: any) => sum + k.metric_value, 0),
      shares: allKpis
        .filter((k: any) => k.metric_name === "shares")
        .reduce((sum: number, k: any) => sum + k.metric_value, 0),
      comments: allKpis
        .filter((k: any) => k.metric_name === "comments")
        .reduce((sum: number, k: any) => sum + k.metric_value, 0),
      platforms: [
        ...new Set(campaign.campaign_versions?.flatMap((v: any) => v.posts?.map((p: any) => p.platform) || []) || []),
      ],
    }
  }

  const maxViews = Math.max(...campaigns.map((campaign) => getCampaignMetrics(campaign).views), 1)

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No published campaigns</h3>
          <p className="text-muted-foreground text-center">Campaign performance metrics will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const metrics = getCampaignMetrics(campaign)
        const engagementRate =
          metrics.views > 0 ? ((metrics.likes + metrics.shares + metrics.comments) / metrics.views) * 100 : 0

        return (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <CardDescription>{campaign.teams?.name}</CardDescription>
                </div>
                <div className="flex gap-1">
                  {metrics.platforms.map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{metrics.views.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{metrics.likes.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{metrics.shares.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Shares</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{metrics.comments.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Performance vs. Best Campaign</span>
                    <span>{((metrics.views / maxViews) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(metrics.views / maxViews) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Engagement Rate</span>
                  <span className="font-medium">{engagementRate.toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
