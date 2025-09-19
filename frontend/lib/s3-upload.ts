"use server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { createAsset } from "./db/assets"
import { AssetType } from "./db/types"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "clippilot-assets"

export async function uploadToS3(file: File, teamId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const fileName = `${teamId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.type,
      ContentDisposition: 'inline',
    })

    await s3Client.send(command)

    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`

    return { success: true, url }
  } catch (error) {
    console.error('S3 upload error:', error)
    return { success: false, error: 'Upload failed' }
  }
}

function getAssetTypeFromFile(file: File): AssetType {
  const mimeType = file.type.toLowerCase()

  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'document'
}

export async function uploadAndCreateAsset(file: File, teamId: string) {
  const uploadResult = await uploadToS3(file, teamId)

  if (!uploadResult.success || !uploadResult.url) {
    return { success: false, error: uploadResult.error || 'Upload failed' }
  }

  try {
    const asset = await createAsset({
      team_id: teamId,
      type: getAssetTypeFromFile(file),
      url: uploadResult.url,
      metadata: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      }
    })

    return { success: true, asset }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to save asset' }
  }
}