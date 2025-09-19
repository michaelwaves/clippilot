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

export function TemplateForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [templateText, setTemplateText] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
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
      console.error("Error loading teams:", error)
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
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

      const { error } = await supabase.from("prompt_templates").insert({
        name,
        description,
        template_text: templateText,
        team_id: selectedTeam,
        created_by: user.id,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Template created successfully",
      })

      router.push("/dashboard/templates")
    } catch (error) {
      console.error("Error creating template:", error)
      toast({
        title: "Error",
        description: "Failed to create template",
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
        <CardTitle>Template Details</CardTitle>
        <CardDescription>Create a reusable prompt template for consistent campaign generation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              placeholder="Product Launch Template"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe when and how to use this template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam} required>
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

          <div className="space-y-2">
            <Label htmlFor="template">Template Content</Label>
            <Textarea
              id="template"
              placeholder="Create a marketing campaign for {product_name} targeting {target_audience}. The campaign should emphasize {key_benefits} and include a call-to-action for {desired_action}..."
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              rows={8}
              required
            />
            <p className="text-sm text-muted-foreground">
              Use curly braces like {"{product_name}"} for variables that can be customized per campaign
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Template
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
