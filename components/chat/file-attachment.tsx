'use client'

import { ProcessedFile } from '@/lib/file-processor'
import { X, Download, Eye, FileText, Image, File } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FileAttachmentProps {
  file: ProcessedFile
  onRemove?: () => void
  onView?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FileAttachment({ 
  file, 
  onRemove, 
  onView, 
  className,
  size = 'md' 
}: FileAttachmentProps) {
  const [imageError, setImageError] = useState(false)

  const isImage = file.type.startsWith('image/')
  const isText = file.type.startsWith('text/') || file.name.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|h|css|html|json|xml|yaml|yml|md)$/i)

  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base'
  }

  const getFileIcon = () => {
    if (isImage) return <Image className="w-4 h-4" />
    if (isText) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn(
      'glass-effect rounded-lg border border-white/20 transition-all duration-200 hover:border-white/40',
      sizeClasses[size],
      className
    )}>
      <div className="flex items-start gap-3">
        {/* File Preview/Icon */}
        <div className="flex-shrink-0">
          {isImage && file.thumbnail && !imageError ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-12 h-12 rounded-lg object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white/60">
              {getFileIcon()}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate" title={file.name}>
            {file.name}
          </h4>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/60 text-xs">
              {formatFileSize(file.size)}
            </span>
            
            {file.metadata?.dimensions && (
              <span className="text-white/60 text-xs">
                {file.metadata.dimensions.width} × {file.metadata.dimensions.height}
              </span>
            )}
          </div>

          {/* File Preview */}
          {file.preview && (
            <p className="text-white/70 text-xs mt-2 line-clamp-2">
              {file.preview}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {onView && (
            <button
              onClick={onView}
              className="p-1 rounded hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title="View file"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => {
              const link = document.createElement('a')
              link.href = file.content
              link.download = file.name
              link.click()
            }}
            className="p-1 rounded hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface FileViewerProps {
  file: ProcessedFile
  onClose: () => void
}

export function FileViewer({ file, onClose }: FileViewerProps) {
  const isImage = file.type.startsWith('image/')
  const isText = file.type.startsWith('text/') || file.name.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|h|css|html|json|xml|yaml|yml|md)$/i)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/60">
              {isImage ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-white font-medium">{file.name}</h3>
              <p className="text-white/60 text-sm">
                {file.type} • {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[70vh]">
          {isImage ? (
            <img
              src={file.content}
              alt={file.name}
              className="max-w-full h-auto rounded-lg"
            />
          ) : isText ? (
            <pre className="text-white/90 text-sm whitespace-pre-wrap font-mono bg-black/20 rounded-lg p-4 overflow-auto">
              {file.content}
            </pre>
          ) : (
            <div className="text-center text-white/60 py-12">
              <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Preview not available for this file type</p>
              <p className="text-sm mt-2">File has been attached to your message</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}