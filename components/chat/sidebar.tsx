'use client'

import { useState } from 'react'
import { ChatThread, ChatSession } from '@/types/chat'
import { useChat } from '@/lib/hooks/use-chat'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Archive, 
  Trash2, 
  Edit3, 
  Settings,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const {
    session,
    activeThread,
    createThread,
    switchThread,
    deleteThread,
    archiveThread,
    updateThreadTitle
  } = useChat()

  const [searchTerm, setSearchTerm] = useState('')
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const filteredThreads = session?.threads.filter(thread => 
    !thread.isArchived && 
    thread.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const archivedThreads = session?.threads.filter(thread => 
    thread.isArchived && 
    thread.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleCreateThread = async () => {
    await createThread()
  }

  const handleEditTitle = (thread: ChatThread) => {
    setEditingThreadId(thread.id)
    setEditTitle(thread.title)
  }

  const handleSaveTitle = () => {
    if (editingThreadId && editTitle.trim()) {
      updateThreadTitle(editingThreadId, editTitle.trim())
    }
    setEditingThreadId(null)
    setEditTitle('')
  }

  const handleCancelEdit = () => {
    setEditingThreadId(null)
    setEditTitle('')
  }

  if (isCollapsed) {
    return (
      <div className="w-16 h-full glass-effect-dark border-r border-white/10 flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-3 rounded-xl hover:bg-white/10 transition-colors mb-4"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
        
        <button
          onClick={handleCreateThread}
          className="p-3 rounded-xl hover:bg-white/10 transition-colors mb-4"
          title="New chat"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>

        <div className="flex-1 overflow-y-auto w-full">
          {filteredThreads.slice(0, 10).map((thread) => (
            <button
              key={thread.id}
              onClick={() => switchThread(thread.id)}
              className={cn(
                'w-full p-3 rounded-xl transition-colors mb-2',
                activeThread?.id === thread.id
                  ? 'bg-violet-500/30 border border-violet-500/50'
                  : 'hover:bg-white/10'
              )}
              title={thread.title}
            >
              <MessageSquare className="w-4 h-4 text-white mx-auto" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 h-full glass-effect-dark border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Conversations</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCreateThread}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredThreads.length === 0 && searchTerm === '' ? (
          <div className="text-center text-white/50 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm">Start a new chat to begin</p>
          </div>
        ) : (
          <>
            {/* Active Threads */}
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  'group relative rounded-xl p-3 transition-all duration-200 cursor-pointer',
                  activeThread?.id === thread.id
                    ? 'bg-violet-500/30 border border-violet-500/50 shadow-lg'
                    : 'hover:bg-white/10'
                )}
                onClick={() => !editingThreadId && switchThread(thread.id)}
              >
                {editingThreadId === thread.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-transparent text-white text-sm focus:outline-none border-b border-white/30 pb-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTitle}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-sm font-medium truncate">
                          {thread.title}
                        </h3>
                        <p className="text-white/60 text-xs mt-1">
                          {thread.messages.length} messages
                        </p>
                        <p className="text-white/40 text-xs">
                          {new Date(thread.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Thread Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTitle(thread)
                          }}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                          title="Edit title"
                        >
                          <Edit3 className="w-3 h-3 text-white/60" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            archiveThread(thread.id)
                          }}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-3 h-3 text-white/60" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Delete this conversation?')) {
                              deleteThread(thread.id)
                            }
                          }}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Thread Tags */}
                    {thread.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {thread.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* Archived Threads */}
            {archivedThreads.length > 0 && (
              <div className="mt-6">
                <h4 className="text-white/60 text-xs font-medium mb-2 px-3">
                  ARCHIVED
                </h4>
                {archivedThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="group rounded-xl p-3 hover:bg-white/5 transition-colors cursor-pointer opacity-60"
                    onClick={() => switchThread(thread.id)}
                  >
                    <h3 className="text-white text-sm truncate">
                      {thread.title}
                    </h3>
                    <p className="text-white/40 text-xs">
                      {new Date(thread.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {searchTerm && filteredThreads.length === 0 && archivedThreads.length === 0 && (
          <div className="text-center text-white/50 py-8">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No conversations found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Import</span>
          </button>
        </div>
        
        <button className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white mt-2">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  )
}