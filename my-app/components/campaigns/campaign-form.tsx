"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Team {
  id: string
  name: string
}

interface Template {
  id: string
  name: string
  description: string
  template_text: string
}

export function CampaignForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load user's teams
      const { data: userTeams } = await supabase.from("team_members").select("teams(id, name)").eq("user_id", user.id)

      if (userTeams) {
        setTeams(userTeams.map((tm: any) => tm.teams).filter(Boolean))
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load teams and templates",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const loadTemplates = async (teamId: string) => {
    try {
      const { data } = await supabase.from("prompt_templates").select("*").eq("team_id", teamId)
      setTemplates(data || [])
    } catch (error) {
      console.error("Error loading templates:", error)
    }
  }

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId)
    setSelectedTemplate("")
    loadTemplates(teamId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) {
      toast({
        title: "Error",
        description: "Please select a team",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert({
          name,
          description,
          team_id: selectedTeam,
          created_by: user.id,
          status: "draft",
        })
        .select()
        .single()

      if (error) throw error

      // Create initial version if template is selected
      if (selectedTemplate && campaign) {
        await supabase.from("campaign_versions").insert({
          campaign_id: campaign.id,
          version_number: 1,
          prompt_template_id: selectedTemplate,
        })
      }

      toast({
        title: "Success",
        description: "Campaign created successfully",
      })

      router.push(`/dashboard/campaigns/${campaign.id}`)
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Details</CardTitle>
        <CardDescription>Provide the basic information for your new marketing campaign</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              placeholder="Summer Product Launch 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the goals and target audience for this campaign..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select value={selectedTeam} onValueChange={handleTeamChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {templates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template">Prompt Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or start from scratch" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-sm text-muted-foreground">
                  {templates.find((t) => t.id === selectedTemplate)?.description}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Campaign
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
