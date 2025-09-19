"use client"
import React from 'react'
import { Assets } from '@/lib/db/types'
import { Image, Video, Music, FileText, Download, Trash2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssetGridProps {
  assets: Assets[]
  onDelete?: (id: string) => void
  onPreview?: (asset: Assets) => void
  className?: string
}

export function AssetGrid({ assets, onDelete, onPreview, className }: AssetGridProps) {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-6 h-6" />
      case 'video':
        return <Video className="w-6 h-6" />
      case 'audio':
        return <Music className="w-6 h-6" />
      default:
        return <FileText className="w-6 h-6" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileName = (asset: Assets) => {
    if (asset.metadata?.filename) {
      return asset.metadata.filename
    }
    const urlParts = asset.url.split('/')
    return urlParts[urlParts.length - 1] || 'Untitled'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString()
  }

  if (assets.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Image className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
        <p className="text-gray-500">Upload your first asset to get started</p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
            {asset.type === 'image' ? (
              <img
                src={asset.url}
                alt={getFileName(asset)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement?.appendChild(
                    (() => {
                      const div = document.createElement('div')
                      div.className = 'flex items-center justify-center w-full h-full text-gray-400'
                      div.innerHTML = '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>'
                      return div
                    })()
                  )
                }}
              />
            ) : (
              <div className="text-gray-400">
                {getAssetIcon(asset.type)}
              </div>
            )}

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                {onPreview && (
                  <button
                    onClick={() => onPreview(asset)}
                    className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <a
                  href={asset.url}
                  download={getFileName(asset)}
                  className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
                {onDelete && (
                  <button
                    onClick={() => onDelete(asset.id!)}
                    className="p-2 bg-white bg-opacity-90 text-red-600 rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-3">
            <h4 className="font-medium text-gray-900 truncate text-sm">
              {getFileName(asset)}
            </h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500 capitalize">
                {asset.type}
              </span>
              {asset.metadata?.size && (
                <span className="text-xs text-gray-400">
                  {formatFileSize(asset.metadata.size)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(asset.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}