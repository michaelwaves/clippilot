-- Insert sample teams
INSERT INTO teams (id, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Marketing Team'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Growth Team')
ON CONFLICT (id) DO NOTHING;

-- Insert sample prompt templates
INSERT INTO prompt_templates (id, team_id, name, description, template_text, created_by) VALUES 
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Product Launch Template', 'Template for new product launches', 'Create a compelling marketing campaign for {product_name} targeting {target_audience}. Highlight {key_benefits} and include a strong call-to-action for {desired_action}.', (SELECT id FROM users LIMIT 1)),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Social Media Template', 'Template for social media campaigns', 'Develop an engaging social media campaign about {topic} that will resonate with {audience}. Focus on {key_message} and encourage {engagement_type}.', (SELECT id FROM users LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaigns
INSERT INTO campaigns (id, team_id, name, description, status, created_by) VALUES 
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Summer Product Launch', 'Launch campaign for our new summer collection', 'published', (SELECT id FROM users LIMIT 1)),
  ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Brand Awareness Campaign', 'Increase brand visibility across social platforms', 'published', (SELECT id FROM users LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaign versions
INSERT INTO campaign_versions (id, campaign_id, version_number, prompt_template_id, generated_content_url) VALUES 
  ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', 1, '550e8400-e29b-41d4-a716-446655440003', 'https://example.com/content1'),
  ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440006', 1, '550e8400-e29b-41d4-a716-446655440004', 'https://example.com/content2')
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (id, campaign_version_id, platform, external_post_id, published_at) VALUES 
  ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440007', 'linkedin', 'linkedin_123', NOW() - INTERVAL '5 days'),
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440007', 'instagram', 'instagram_456', NOW() - INTERVAL '5 days'),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440008', 'youtube', 'youtube_789', NOW() - INTERVAL '3 days'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440008', 'tiktok', 'tiktok_101', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample KPIs
INSERT INTO kpis (post_id, metric_name, metric_value, scraped_at) VALUES 
  -- LinkedIn post metrics
  ('550e8400-e29b-41d4-a716-446655440009', 'views', 15420, NOW() - INTERVAL '4 days'),
  ('550e8400-e29b-41d4-a716-446655440009', 'likes', 342, NOW() - INTERVAL '4 days'),
  ('550e8400-e29b-41d4-a716-446655440009', 'shares', 89, NOW() - INTERVAL '4 days'),
  ('550e8400-e29b-41d4-a716-446655440009', 'comments', 67, NOW() - INTERVAL '4 days'),
  
  -- Instagram post metrics
  ('550e8400-e29b-41d4-a716-446655440010', 'views', 28750, NOW() - INTERVAL '4 days'),
  ('550e8400-e29b-41d4-a716-446655440010', 'likes', 1250, NOW() - INTERVAL '4 days'),
  ('550e8400-e29b-41d4-a716-446655440010', 'shares', 156, NOW() - INTERVAL '4 days'),
  ('550e8400-e29b-41d4-a716-446655440010', 'comments', 234, NOW() - INTERVAL '4 days'),
  
  -- YouTube post metrics
  ('550e8400-e29b-41d4-a716-446655440011', 'views', 45680, NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440011', 'likes', 892, NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440011', 'shares', 234, NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440011', 'comments', 156, NOW() - INTERVAL '2 days'),
  
  -- TikTok post metrics
  ('550e8400-e29b-41d4-a716-446655440012', 'views', 67890, NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440012', 'likes', 2340, NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440012', 'shares', 567, NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440012', 'comments', 445, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
