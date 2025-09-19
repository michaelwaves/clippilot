import { TemplateForm } from "@/components/templates/template-form"

export default function NewTemplatePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Create New Template</h1>
        <p className="text-muted-foreground">Create a reusable prompt template for campaign generation</p>
      </div>
      <TemplateForm />
    </div>
  )
}
