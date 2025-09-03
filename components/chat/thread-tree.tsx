'use client'

import { useState } from 'react'
import { Message } from '@/types/chat'
import { MessageBubble } from './message-bubble'
import { ChevronDown, ChevronRight, GitBranch, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageNode {
  message: Message
  children: MessageNode[]
  isExpanded: boolean
  depth: number
}

interface ThreadTreeProps {
  messages: Message[]
  onSendMessage: (content: string, parentId?: string) => Promise<void>
  onEditMessage: (messageId: string, content: string) => void
  onDeleteMessage: (messageId: string) => void
  onRegenerateMessage: (messageId: string) => Promise<void>
  className?: string
}

export function ThreadTree({
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onRegenerateMessage,
  className
}: ThreadTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  // Build message tree structure
  const buildMessageTree = (messages: Message[]): MessageNode[] => {
    const messageMap = new Map<string, MessageNode>()
    const rootNodes: MessageNode[] = []

    // Create nodes for all messages
    messages.forEach(message => {
      messageMap.set(message.id, {
        message,
        children: [],
        isExpanded: expandedNodes.has(message.id),
        depth: 0
      })
    })

    // Build parent-child relationships
    messages.forEach(message => {
      const node = messageMap.get(message.id)!
      
      if (message.parentId) {
        const parent = messageMap.get(message.parentId)
        if (parent) {
          parent.children.push(node)
          node.depth = parent.depth + 1
        } else {
          rootNodes.push(node)
        }
      } else {
        rootNodes.push(node)
      }
    })

    return rootNodes
  }

  const toggleExpanded = (messageId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return
    
    await onSendMessage(replyContent.trim(), parentId)
    setReplyingTo(null)
    setReplyContent('')
  }

  const renderMessageNode = (node: MessageNode): React.ReactNode => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedNodes.has(node.message.id)
    const isReplying = replyingTo === node.message.id

    return (
      <div key={node.message.id} className="relative">
        {/* Connection Lines */}
        {node.depth > 0 && (
          <div 
            className="absolute left-0 top-0 w-px bg-white/20"
            style={{ 
              height: '50px',
              marginLeft: `${(node.depth - 1) * 24 + 12}px`
            }}
          />
        )}
        
        {node.depth > 0 && (
          <div 
            className="absolute top-6 bg-white/20"
            style={{ 
              left: `${(node.depth - 1) * 24 + 12}px`,
              width: '12px',
              height: '1px'
            }}
          />
        )}

        {/* Message Container */}
        <div 
          className="flex items-start gap-3"
          style={{ marginLeft: `${node.depth * 24}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(node.message.id)}
              className="mt-4 p-1 rounded hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title={isExpanded ? "Collapse thread" : "Expand thread"}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Message */}
          <div className="flex-1">
            <MessageBubble
              message={node.message}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              onRegenerate={onRegenerateMessage}
              className="mb-2"
            />

            {/* Thread Actions */}
            <div className="flex items-center gap-2 ml-4 mb-4">
              {hasChildren && (
                <div className="flex items-center gap-1 text-xs text-white/50">
                  <GitBranch className="w-3 h-3" />
                  <span>{node.children.length} replies</span>
                </div>
              )}
              
              <button
                onClick={() => setReplyingTo(node.message.id)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Reply
              </button>
            </div>

            {/* Reply Input */}
            {isReplying && (
              <div className="ml-4 mb-4">
                <div className="glass-effect rounded-lg p-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full bg-transparent text-white placeholder-white/50 resize-none focus:outline-none min-h-[60px]"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                      className="px-3 py-1 text-sm text-white/60 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(node.message.id)}
                      disabled={!replyContent.trim()}
                      className="px-3 py-1 text-sm bg-violet-500 hover:bg-violet-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Child Messages */}
            {hasChildren && isExpanded && (
              <div className="space-y-4">
                {node.children.map(childNode => renderMessageNode(childNode))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const messageTree = buildMessageTree(messages)

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60">
        <GitBranch className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No messages yet</h3>
        <p className="text-sm">Start a conversation to see the thread tree</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {messageTree.map(node => renderMessageNode(node))}
    </div>
  )
}