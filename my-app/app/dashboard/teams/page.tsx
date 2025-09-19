import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar, Crown } from "lucide-react"
import Link from "next/link"

export default async function TeamsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's teams with member counts
  const { data: userTeams } = await supabase
    .from("team_members")
    .select(`
      *,
      teams(
        *,
        team_members(count)
      )
    `)
    .eq("user_id", user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Teams</h1>
          <p className="text-muted-foreground">Manage your team memberships and collaborations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Join Team
        </Button>
      </div>

      {userTeams && userTeams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userTeams.map((membership) => (
            <Card key={membership.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{membership.teams?.name}</CardTitle>
                    <CardDescription>Team workspace</CardDescription>
                  </div>
                  <Badge variant={membership.role === "admin" ? "default" : "secondary"}>
                    {membership.role === "admin" ? (
                      <>
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      "Member"
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {membership.teams?.team_members?.length || 0} members
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {new Date(membership.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Link href={`/dashboard/teams/${membership.teams?.id}`}>
                      <Button variant="outline" size="sm">
                        View Team
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
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No teams yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Join a team to start collaborating on marketing campaigns
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Join Your First Team
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
