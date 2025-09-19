"use client";
import { useState, useEffect } from 'react'
import { FileUpload } from '@/components/ui/file-upload'
import { AssetGrid } from '@/components/ui/asset-grid'
import { uploadAndCreateAsset } from '@/lib/s3-upload'
import { getAssetsByTeamId, deleteAsset } from '@/lib/db/assets'
import { Assets } from '@/lib/db/types'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Plus } from 'lucide-react'

export default function AssetsPage() {
  const [assets, setAssets] = useState<Assets[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // Mock team ID - replace with actual team context
  const teamId = "team-123"

  const loadAssets = async () => {
    try {
      setIsLoading(true)
      const fetchedAssets = await getAssetsByTeamId(teamId)
      setAssets(fetchedAssets)
    } catch (error) {
      console.error('Failed to load assets:', error)
      toast.error('Failed to load assets')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  const handleFilesSelected = async (files: File[]) => {
    setIsUploading(true)
    let successCount = 0

    for (const file of files) {
      try {
        const result = await uploadAndCreateAsset(file, teamId)
        if (result.success && result.asset) {
          setAssets(prev => [result.asset, ...prev])
          successCount++
        } else {
          toast.error(`Failed to upload ${file.name}: ${result.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    setIsUploading(false)

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`)
      setShowUpload(false)
    }
  }

  const handleDeleteAsset = async (id: string) => {
    try {
      await deleteAsset(id)
      setAssets(prev => prev.filter(asset => asset.id !== id))
      toast.success('Asset deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete asset')
    }
  }

  const handlePreviewAsset = (asset: Assets) => {
    // Open asset in new tab for preview
    window.open(asset.url, '_blank')
  }

  const filterAssetsByType = (type: string) => {
    if (type === 'all') return assets
    return assets.filter(asset => asset.type === type)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-gray-600">Manage your media library and brand assets</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={loadAssets}
            disabled={isLoading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Assets
          </Button>
        </div>
      </div>

      {showUpload && (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Upload New Assets</h2>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            className="mb-4"
          />
          {isUploading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">Uploading assets...</span>
              </div>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({assets.length})</TabsTrigger>
          <TabsTrigger value="image">Images ({filterAssetsByType('image').length})</TabsTrigger>
          <TabsTrigger value="video">Videos ({filterAssetsByType('video').length})</TabsTrigger>
          <TabsTrigger value="audio">Audio ({filterAssetsByType('audio').length})</TabsTrigger>
          <TabsTrigger value="document">Documents ({filterAssetsByType('document').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading assets...</p>
            </div>
          ) : (
            <AssetGrid
              assets={assets}
              onDelete={handleDeleteAsset}
              onPreview={handlePreviewAsset}
            />
          )}
        </TabsContent>

        <TabsContent value="image" className="mt-6">
          <AssetGrid
            assets={filterAssetsByType('image')}
            onDelete={handleDeleteAsset}
            onPreview={handlePreviewAsset}
          />
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <AssetGrid
            assets={filterAssetsByType('video')}
            onDelete={handleDeleteAsset}
            onPreview={handlePreviewAsset}
          />
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
          <AssetGrid
            assets={filterAssetsByType('audio')}
            onDelete={handleDeleteAsset}
            onPreview={handlePreviewAsset}
          />
        </TabsContent>

        <TabsContent value="document" className="mt-6">
          <AssetGrid
            assets={filterAssetsByType('document')}
            onDelete={handleDeleteAsset}
            onPreview={handlePreviewAsset}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}