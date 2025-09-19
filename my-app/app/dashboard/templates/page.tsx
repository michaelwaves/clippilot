import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, User, Calendar } from "lucide-react"
import Link from "next/link"

export default async function TemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's templates
  const { data: templates } = await supabase
    .from("prompt_templates")
    .select(`
      *,
      teams(name),
      users!prompt_templates_created_by_fkey(name)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Prompt Templates</h1>
          <p className="text-muted-foreground">Create and manage reusable campaign templates</p>
        </div>
        <Link href="/dashboard/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </Link>
      </div>

      {templates && templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground line-clamp-3">{template.template_text}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {template.users?.name}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    {template.teams?.name}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(template.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Link href={`/dashboard/templates/${template.id}`}>
                      <Button variant="outline" size="sm">
                        Edit Template
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
            <h3 className="text-lg font-medium mb-2">No templates yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first prompt template to streamline campaign creation
            </p>
            <Link href="/dashboard/templates/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
