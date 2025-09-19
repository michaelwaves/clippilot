"use client";
import { useState, useEffect } from 'react'
import { AssetGrid } from '@/components/ui/asset-grid'
import { getAssetsByTeamId, getAssetsByType, deleteAsset } from '@/lib/db/assets'
import { Assets, AssetType } from '@/lib/db/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, SortAsc, SortDesc, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type SortField = 'name' | 'type' | 'size' | 'date'
type SortOrder = 'asc' | 'desc'

export default function AssetsLibraryPage() {
  const [assets, setAssets] = useState<Assets[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Assets[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Mock team ID - replace with actual team context
  const teamId = "3b6e3b69-2c16-4a2a-91c7-4cf653ab9f22"

  const loadAssets = async () => {
    try {
      setIsLoading(true)
      const fetchedAssets = await getAssetsByTeamId(teamId)
      setAssets(fetchedAssets)
      setFilteredAssets(fetchedAssets)
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

  useEffect(() => {
    let filtered = [...assets]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(asset => {
        const filename = asset.metadata?.filename || asset.url.split('/').pop() || ''
        return filename.toLowerCase().includes(searchQuery.toLowerCase())
      })
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(asset => asset.type === typeFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'name':
          aValue = (a.metadata?.filename || a.url.split('/').pop() || '').toLowerCase()
          bValue = (b.metadata?.filename || b.url.split('/').pop() || '').toLowerCase()
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'size':
          aValue = a.metadata?.size || 0
          bValue = b.metadata?.size || 0
          break
        case 'date':
          aValue = new Date(a.created_at || 0).getTime()
          bValue = new Date(b.created_at || 0).getTime()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredAssets(filtered)
  }, [assets, searchQuery, typeFilter, sortField, sortOrder])

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
    window.open(asset.url, '_blank')
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalSize = () => {
    return filteredAssets.reduce((total, asset) => {
      return total + (asset.metadata?.size || 0)
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/assets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assets
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Assets Library</h1>
            <p className="text-gray-600">Browse and manage all your uploaded assets</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading assets library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/assets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assets
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Assets Library</h1>
            <p className="text-gray-600">Browse and manage all your uploaded assets</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {filteredAssets.length} of {assets.length} assets
          </p>
          <p className="text-xs text-gray-400">
            Total size: {formatFileSize(getTotalSize())}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assets by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(value: AssetType | 'all') => setTypeFilter(value)}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={toggleSortOrder}>
              {sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <AssetGrid
        assets={filteredAssets}
        onDelete={handleDeleteAsset}
        onPreview={handlePreviewAsset}
      />
    </div>
  )
}