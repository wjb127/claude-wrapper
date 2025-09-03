'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, Square, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 4000,
  className
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || isLoading || disabled) return

    const content = input.trim()
    const files = [...attachments]
    
    setInput('')
    setAttachments([])
    
    await onSendMessage(content, files)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    setAttachments(prev => [...prev, ...files])
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording
  }

  const characterCount = input.length
  const isNearLimit = characterCount > maxLength * 0.8
  const isOverLimit = characterCount > maxLength

  return (
    <div className={cn('p-4', className)}>
      <div className="max-w-4xl mx-auto">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="truncate max-w-32">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Container */}
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              'glass-effect rounded-2xl p-3 shadow-xl transition-all duration-300',
              dragOver && 'ring-2 ring-violet-500 bg-violet-500/10',
              !disabled && 'hover-lift'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Main Input Area */}
            <div className="flex gap-3 items-end">
              {/* File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                title="Attach file"
                disabled={disabled}
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="w-full resize-none bg-transparent text-white placeholder-white/50 px-4 py-3 focus:outline-none min-h-[50px] max-h-[200px]"
                  disabled={disabled || isLoading}
                  rows={1}
                  maxLength={maxLength}
                />
                
                {/* Character Count */}
                {isNearLimit && (
                  <div className={cn(
                    'absolute bottom-1 right-2 text-xs',
                    isOverLimit ? 'text-red-400' : 'text-yellow-400'
                  )}>
                    {characterCount}/{maxLength}
                  </div>
                )}
              </div>

              {/* Voice Recording */}
              <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'hover:bg-white/10 text-white/60 hover:text-white'
                )}
                title={isRecording ? "Stop recording" : "Voice input"}
                disabled={disabled}
              >
                {isRecording ? (
                  <Square className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading || disabled || isOverLimit}
                className={cn(
                  'rounded-xl px-6 py-3 transition-all duration-300 shadow-lg flex items-center justify-center min-w-[60px]',
                  !input.trim() || isLoading || disabled || isOverLimit
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 hover-lift'
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Input Helper Text */}
            <div className="flex items-center justify-between mt-2 px-4">
              <p className="text-xs text-white/40">
                Press Enter to send, Shift+Enter for new line
              </p>
              
              {input.trim() && (
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Sparkles className="w-3 h-3" />
                  <span>AI will respond</span>
                </div>
              )}
            </div>

            {/* Drag & Drop Overlay */}
            {dragOver && (
              <div className="absolute inset-0 bg-violet-500/20 border-2 border-dashed border-violet-500 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="text-center text-white">
                  <Paperclip className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Drop files here</p>
                  <p className="text-sm text-white/70">Supports images, documents, and code files</p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.xml,.yaml,.yml"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}