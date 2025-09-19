"use server"
import { db } from "./kysely"
import { AssetType } from "./types"

export type CreateAssetInput = {
  team_id: string;
  type: AssetType;
  url: string;
  metadata?: any;
};

export type UpdateAssetInput = {
  type?: AssetType;
  url?: string;
  metadata?: any;
};

export async function createAsset(asset: CreateAssetInput) {
    return await db.insertInto('assets')
        .values(asset)
        .returningAll()
        .executeTakeFirstOrThrow()
}

export async function getAssetById(id: string) {
    return await db.selectFrom('assets')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst()
}

export async function getAssetsByTeamId(teamId: string) {
    return await db.selectFrom('assets')
        .where('team_id', '=', teamId)
        .selectAll()
        .orderBy('created_at', 'desc')
        .execute()
}

export async function updateAsset(id: string, updates: UpdateAssetInput) {
    return await db.updateTable('assets')
        .set(updates)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst()
}

export async function deleteAsset(id: string) {
    return await db.deleteFrom('assets')
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst()
}

export async function getAssetsByType(teamId: string, type: AssetType) {
    return await db.selectFrom('assets')
        .where('team_id', '=', teamId)
        .where('type', '=', type)
        .selectAll()
        .orderBy('created_at', 'desc')
        .execute()
}
