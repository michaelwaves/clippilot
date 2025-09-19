-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('marketer', 'manager', 'compliance')) NOT NULL DEFAULT 'marketer',
  stytch_user_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'member')) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('logo', 'font', 'color', 'video_snippet')) NOT NULL,
  url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt_templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_text TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'published')) NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_versions table
CREATE TABLE IF NOT EXISTS campaign_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  prompt_template_id UUID REFERENCES prompt_templates(id),
  generated_content_url TEXT,
  ai_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, version_number)
);

-- Create approvals table
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_version_id UUID NOT NULL REFERENCES campaign_versions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  status TEXT CHECK (status IN ('approved', 'rejected')) NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_version_id UUID NOT NULL REFERENCES campaign_versions(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('linkedin', 'youtube', 'instagram', 'tiktok')) NOT NULL,
  external_post_id TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kpis table
CREATE TABLE IF NOT EXISTS kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for teams table
CREATE POLICY "Team members can view their teams" ON teams FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = teams.id 
    AND team_members.user_id = auth.uid()
  )
);

-- RLS Policies for team_members table
CREATE POLICY "Team members can view team membership" ON team_members FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = team_members.team_id 
    AND tm.user_id = auth.uid()
  )
);

-- RLS Policies for assets table
CREATE POLICY "Team members can view team assets" ON assets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = assets.team_id 
    AND team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can insert team assets" ON assets FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = assets.team_id 
    AND team_members.user_id = auth.uid()
  )
);

-- RLS Policies for prompt_templates table
CREATE POLICY "Team members can view team templates" ON prompt_templates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = prompt_templates.team_id 
    AND team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can create templates" ON prompt_templates FOR INSERT WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = prompt_templates.team_id 
    AND team_members.user_id = auth.uid()
  )
);

-- RLS Policies for campaigns table
CREATE POLICY "Team members can view team campaigns" ON campaigns FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = campaigns.team_id 
    AND team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can create campaigns" ON campaigns FOR INSERT WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = campaigns.team_id 
    AND team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can update campaigns" ON campaigns FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = campaigns.team_id 
    AND team_members.user_id = auth.uid()
  )
);

-- RLS Policies for campaign_versions table
CREATE POLICY "Team members can view campaign versions" ON campaign_versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN team_members tm ON tm.team_id = c.team_id
    WHERE c.id = campaign_versions.campaign_id 
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can create campaign versions" ON campaign_versions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN team_members tm ON tm.team_id = c.team_id
    WHERE c.id = campaign_versions.campaign_id 
    AND tm.user_id = auth.uid()
  )
);

-- RLS Policies for approvals table
CREATE POLICY "Team members can view approvals" ON approvals FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM campaign_versions cv
    JOIN campaigns c ON c.id = cv.campaign_id
    JOIN team_members tm ON tm.team_id = c.team_id
    WHERE cv.id = approvals.campaign_version_id 
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Reviewers can create approvals" ON approvals FOR INSERT WITH CHECK (
  reviewer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM campaign_versions cv
    JOIN campaigns c ON c.id = cv.campaign_id
    JOIN team_members tm ON tm.team_id = c.team_id
    WHERE cv.id = approvals.campaign_version_id 
    AND tm.user_id = auth.uid()
  )
);

-- RLS Policies for posts table
CREATE POLICY "Team members can view posts" ON posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM campaign_versions cv
    JOIN campaigns c ON c.id = cv.campaign_id
    JOIN team_members tm ON tm.team_id = c.team_id
    WHERE cv.id = posts.campaign_version_id 
    AND tm.user_id = auth.uid()
  )
);

-- RLS Policies for kpis table
CREATE POLICY "Team members can view kpis" ON kpis FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM posts p
    JOIN campaign_versions cv ON cv.id = p.campaign_version_id
    JOIN campaigns c ON c.id = cv.campaign_id
    JOIN team_members tm ON tm.team_id = c.team_id
    WHERE p.id = kpis.post_id 
    AND tm.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_assets_team_id ON assets(team_id);
CREATE INDEX idx_prompt_templates_team_id ON prompt_templates(team_id);
CREATE INDEX idx_campaigns_team_id ON campaigns(team_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_versions_campaign_id ON campaign_versions(campaign_id);
CREATE INDEX idx_approvals_campaign_version_id ON approvals(campaign_version_id);
CREATE INDEX idx_posts_campaign_version_id ON posts(campaign_version_id);
CREATE INDEX idx_kpis_post_id ON kpis(post_id);
