'use client'

import { useState } from 'react'
import { Message } from '@/types/chat'
import { MessageFormatter } from '@/components/ui/message-formatter'
import { TypingEffect } from '@/components/ui/typing-effect'
import { Bot, User, Edit3, Trash2, RotateCcw, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  isTyping?: boolean
  showActions?: boolean
  onEdit?: (messageId: string, content: string) => void
  onDelete?: (messageId: string) => void
  onRegenerate?: (messageId: string) => void
  className?: string
}

export function MessageBubble({
  message,
  isTyping = false,
  showActions = true,
  onEdit,
  onDelete,
  onRegenerate,
  className
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message.id, editContent)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        'group flex gap-4 transition-all duration-200',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      {isAssistant && (
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'max-w-[70%] rounded-2xl shadow-lg transition-all duration-200',
        isUser 
          ? 'glass-effect bg-white/20 text-white' 
          : 'glass-effect text-white',
        isHovered && 'shadow-xl transform scale-[1.02]'
      )}>
        {/* Message Actions */}
        {showActions && isHovered && (
          <div className={cn(
            'flex gap-1 p-2 border-b border-white/10',
            isUser ? 'justify-end' : 'justify-start'
          )}>
            <button
              onClick={handleCopy}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white/60 hover:text-white" />
              )}
            </button>
            
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Edit message"
              >
                <Edit3 className="w-4 h-4 text-white/60 hover:text-white" />
              </button>
            )}
            
            {onRegenerate && isAssistant && (
              <button
                onClick={() => onRegenerate(message.id)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-4 h-4 text-white/60 hover:text-white" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
              </button>
            )}
          </div>
        )}

        {/* Message Body */}
        <div className="px-5 py-3">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent text-white placeholder-white/50 resize-none focus:outline-none min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-sm bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {isTyping && isAssistant ? (
                <TypingEffect
                  text={message.content}
                  speed={50}
                  className="leading-relaxed"
                />
              ) : (
                <MessageFormatter content={message.content} />
              )}
            </>
          )}
        </div>

        {/* Message Footer */}
        <div className={cn(
          'px-5 pb-3 flex items-center justify-between text-xs',
          isUser ? 'text-white/60' : 'text-white/60'
        )}>
          <span>
            {new Date(message.timestamp).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          
          {message.metadata && (
            <div className="flex items-center gap-2">
              {message.metadata.tokens && (
                <span className="text-white/40">
                  {message.metadata.tokens} tokens
                </span>
              )}
              {message.metadata.duration && (
                <span className="text-white/40">
                  {(message.metadata.duration / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  )
}