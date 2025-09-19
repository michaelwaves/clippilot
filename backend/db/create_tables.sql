-- ===== ENUM TYPES =====
CREATE TYPE asset_type AS ENUM ('logo', 'font', 'color', 'video_snippet');
CREATE TYPE campaign_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'published');
CREATE TYPE approval_status AS ENUM ('approved', 'rejected');
CREATE TYPE platform_type AS ENUM ('linkedin', 'youtube', 'instagram', 'tiktok');

-- ===== ASSETS =====
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL, -- Stytch organization ID
    type asset_type NOT NULL,
    url TEXT NOT NULL,
    metadata JSONB, -- e.g. hex code, font name, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== PROMPT TEMPLATES =====
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL, -- Stytch organization ID
    name TEXT NOT NULL,
    description TEXT,
    template_text TEXT NOT NULL,
    created_by UUID NOT NULL, -- Stytch user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== CAMPAIGNS (CONSOLIDATED WITH VERSION INFO) =====
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL, -- Stytch organization ID
    name TEXT NOT NULL,
    description TEXT,
    status campaign_status NOT NULL DEFAULT 'draft',

    -- Versioning
    version_number INT NOT NULL DEFAULT 1,
    prompt_template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
    generated_content_url TEXT,
    ai_metadata JSONB,

    -- Creator & timestamps
    created_by UUID NOT NULL, -- Stytch user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== APPROVALS =====
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL, -- Stytch user ID
    status approval_status NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== POSTS =====
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    external_post_id TEXT, -- e.g., LinkedIn post ID
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== KPIS =====
CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL, -- e.g., "views", "likes"
    metric_value NUMERIC NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== INDEXES (optional) =====
CREATE INDEX idx_assets_team ON assets(team_id);
CREATE INDEX idx_prompt_templates_team ON prompt_templates(team_id);
CREATE INDEX idx_campaigns_team ON campaigns(team_id);
CREATE INDEX idx_posts_campaign ON posts(campaign_id);
CREATE INDEX idx_kpis_post ON kpis(post_id);
CREATE INDEX idx_approvals_campaign ON approvals(campaign_id);
