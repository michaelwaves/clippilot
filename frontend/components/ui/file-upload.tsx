"use client"
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, Image, Video, Music, FileText, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  className?: string
}

interface FileWithPreview extends File {
  preview?: string
}

export function FileUpload({
  onFilesSelected,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'video/*': ['.mp4', '.webm', '.mov'],
    'audio/*': ['.mp3', '.wav', '.ogg'],
    'application/pdf': ['.pdf'],
  },
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  className
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }
      return fileWithPreview
    })

    setUploadedFiles(prev => [...prev, ...filesWithPreview])
    onFilesSelected(acceptedFiles)
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />
    if (file.type.startsWith('audio/')) return <Music className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          isDragReject ? 'border-red-500 bg-red-50' : '',
          'hover:border-gray-400 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <Upload className={cn(
            'w-12 h-12',
            isDragActive ? 'text-blue-500' : 'text-gray-400'
          )} />
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop the files here...</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports images, videos, audio files, and PDFs (max {formatFileSize(maxSize)})
              </p>
            </>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}