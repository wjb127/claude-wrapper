import { NextRequest, NextResponse } from 'next/server'
import { FileProcessor } from '@/lib/file-processor'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files.length) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 })
    }

    const processor = new FileProcessor({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'text/plain',
        'text/markdown',
        'application/json',
        'text/javascript',
        'text/typescript',
        'text/css',
        'text/html',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'application/pdf'
      ],
      generateThumbnails: true,
      extractText: true
    })

    const processedFiles = await processor.processFiles(files)

    return NextResponse.json({
      success: true,
      data: {
        files: processedFiles,
        count: processedFiles.length
      }
    })
  } catch (error) {
    console.error('File upload error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process files'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      maxFileSize: 10 * 1024 * 1024,
      allowedTypes: [
        'text/plain',
        'text/markdown',
        'application/json',
        'text/javascript',
        'text/typescript',
        'text/css',
        'text/html',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'application/pdf'
      ]
    }
  })
}