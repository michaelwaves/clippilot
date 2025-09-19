export interface Database {
  assets: Assets;
}

export interface Assets {
  id?: string;
  created_at?: string | null;
  team_id: string;
  type: AssetType;
  url: string;
  metadata?: any | null;
}

export type AssetType = 'image' | 'video' | 'audio' | 'document';