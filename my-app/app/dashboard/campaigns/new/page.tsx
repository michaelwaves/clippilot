import { CampaignForm } from "@/components/campaigns/campaign-form"

export default function NewCampaignPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Create New Campaign</h1>
        <p className="text-muted-foreground">Set up your marketing campaign with AI-powered content generation</p>
      </div>
      <CampaignForm />
    </div>
  )
}
