-- ===== ENUM TYPES =====
CREATE TYPE asset_type AS ENUM ('logo', 'font', 'color', 'video','image');
CREATE TYPE campaign_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'published');
CREATE TYPE approval_status AS ENUM ('approved', 'rejected');
CREATE TYPE platform_type AS ENUM ('linkedin', 'youtube', 'instagram', 'tiktok');

-- ===== ASSETS =====
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    type asset_type NOT NULL,
    url TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== PROMPT TEMPLATES =====
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    template_text TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== CAMPAIGNS =====
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status campaign_status NOT NULL DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== CAMPAIGN VERSIONS =====
CREATE TABLE campaign_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    prompt_template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
    generated_content_url TEXT,
    ai_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== APPROVALS =====
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_version_id UUID NOT NULL REFERENCES campaign_versions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status approval_status NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== POSTS =====
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_version_id UUID NOT NULL REFERENCES campaign_versions(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    external_post_id TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== KPIS =====
CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);