'use client'

import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Trash2, Menu, X, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface SidebarProps {
  currentConversationId?: string
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
}

export function Sidebar({ 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation 
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const response = await fetch('/api/conversations')
    if (response.ok) {
      const data = await response.json()
      setConversations(data)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this conversation?')) return

    const response = await fetch(`/api/conversations/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      setConversations(conversations.filter(c => c.id !== id))
      if (currentConversationId === id) {
        onNewConversation()
      }
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 text-white transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="p-4">
            <button
              onClick={onNewConversation}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-800",
                    currentConversationId === conv.id && "bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                  </button>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 p-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
        />
      )}
    </>
  )
}