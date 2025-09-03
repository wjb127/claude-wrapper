export interface ProcessedFile {
  id: string
  name: string
  type: string
  size: number
  content: string
  preview?: string
  thumbnail?: string
  metadata?: {
    dimensions?: { width: number; height: number }
    duration?: number
    pages?: number
  }
}

export interface FileProcessorOptions {
  maxFileSize: number // in bytes
  allowedTypes: string[]
  generateThumbnails: boolean
  extractText: boolean
}

export class FileProcessor {
  private options: FileProcessorOptions

  constructor(options: Partial<FileProcessorOptions> = {}) {
    this.options = {
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
      extractText: true,
      ...options
    }
  }

  async processFiles(files: File[]): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = []

    for (const file of files) {
      try {
        const processed = await this.processFile(file)
        if (processed) {
          processedFiles.push(processed)
        }
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error)
      }
    }

    return processedFiles
  }

  async processFile(file: File): Promise<ProcessedFile | null> {
    // Validate file
    if (!this.validateFile(file)) {
      throw new Error(`File ${file.name} is not allowed or too large`)
    }

    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const processedFile: ProcessedFile = {
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      content: ''
    }

    // Process based on file type
    if (file.type.startsWith('text/') || this.isCodeFile(file)) {
      processedFile.content = await this.readTextFile(file)
      processedFile.preview = this.generateTextPreview(processedFile.content)
    } else if (file.type.startsWith('image/')) {
      processedFile.content = await this.readImageFile(file)
      if (this.options.generateThumbnails) {
        processedFile.thumbnail = await this.generateImageThumbnail(file)
      }
      processedFile.metadata = await this.getImageMetadata(file)
    } else if (file.type === 'application/pdf') {
      if (this.options.extractText) {
        processedFile.content = await this.extractPdfText(file)
        processedFile.preview = this.generateTextPreview(processedFile.content)
      }
    } else if (file.type === 'application/json') {
      const text = await this.readTextFile(file)
      try {
        const json = JSON.parse(text)
        processedFile.content = JSON.stringify(json, null, 2)
        processedFile.preview = this.generateTextPreview(processedFile.content)
      } catch {
        processedFile.content = text
        processedFile.preview = this.generateTextPreview(text)
      }
    }

    return processedFile
  }

  private validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.options.maxFileSize) {
      return false
    }

    // Check file type
    if (!this.options.allowedTypes.includes(file.type) && !this.isCodeFile(file)) {
      return false
    }

    return true
  }

  private isCodeFile(file: File): boolean {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
      '.vue', '.svelte', '.css', '.scss', '.sass', '.less', '.html',
      '.xml', '.yaml', '.yml', '.toml', '.ini', '.conf', '.sh', '.bat'
    ]
    
    return codeExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  private async readImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error('Failed to read image'))
      reader.readAsDataURL(file)
    })
  }

  private async generateImageThumbnail(file: File, maxSize: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      img.onload = () => {
        const { width, height } = this.calculateThumbnailSize(img.width, img.height, maxSize)
        
        canvas.width = width
        canvas.height = height
        
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      
      img.onerror = () => reject(new Error('Failed to generate thumbnail'))
      img.src = URL.createObjectURL(file)
    })
  }

  private calculateThumbnailSize(width: number, height: number, maxSize: number) {
    if (width <= maxSize && height <= maxSize) {
      return { width, height }
    }
    
    const ratio = Math.min(maxSize / width, maxSize / height)
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    }
  }

  private async getImageMetadata(file: File): Promise<{ dimensions: { width: number; height: number } }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({
        dimensions: { width: img.width, height: img.height }
      })
      img.onerror = () => reject(new Error('Failed to get image metadata'))
      img.src = URL.createObjectURL(file)
    })
  }

  private async extractPdfText(file: File): Promise<string> {
    // This is a placeholder - in a real implementation, you'd use a PDF library
    // like pdf-parse or PDF.js
    return `[PDF Content: ${file.name}]\n\nThis is a PDF file. Content extraction would require a PDF processing library.`
  }

  private generateTextPreview(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) {
      return content
    }
    
    return content.substring(0, maxLength) + '...'
  }

  // File format utilities
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.startsWith('text/')) return '📄'
    if (fileType === 'application/pdf') return '📕'
    if (fileType === 'application/json') return '📋'
    return '📎'
  }
}