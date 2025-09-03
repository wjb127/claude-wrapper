'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/lib/hooks/use-chat'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { Sidebar } from './sidebar'
import { SettingsPanel } from './settings-panel'
import { PluginManagerComponent } from './plugin-manager'
import { TemplateSelector } from './template-selector'
import { ThreadTree } from './thread-tree'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProgressBar } from '@/components/ui/progress-bar'
import { PluginManager } from '@/lib/plugin-system'
import { PromptTemplatesPlugin } from '@/lib/plugins/prompt-templates'
import { 
  Sparkles, 
  Menu, 
  Settings, 
  Maximize2, 
  Minimize2,
  Wifi,
  WifiOff,
  AlertCircle,
  Puzzle,
  FileText,
  GitBranch,
  Layout
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function EnhancedChatInterface() {
  const {
    session,
    activeThread,
    isLoading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    regenerateMessage,
    clearContext
  } = useChat()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pluginManagerOpen, setPluginManagerOpen] = useState(false)
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [viewMode, setViewMode] = useState<'linear' | 'threaded'>('linear')
  const [templates, setTemplates] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread?.messages])

  // Initialize plugin manager and templates
  useEffect(() => {
    const initializePlugins = async () => {
      try {
        const pluginManager = PluginManager.getInstance()
        const promptPlugin = pluginManager.getPlugin('prompt-templates') as PromptTemplatesPlugin
        if (promptPlugin) {
          setTemplates(promptPlugin.getTemplates())
        }
      } catch (error) {
        console.error('Failed to initialize plugins:', error)
      }
    }
    
    initializePlugins()
  }, [])

  // Fullscreen handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    try {
      // Handle file uploads if any
      if (attachments && attachments.length > 0) {
        setUploadProgress(0)
        
        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval)
              return 100
            }
            return prev + 10
          })
        }, 100)
        
        // Process attachments here
        // TODO: Implement file processing
        
        setTimeout(() => {
          setUploadProgress(0)
        }, 2000)
      }

      await sendMessage(content)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleEditMessage = (messageId: string, content: string) => {
    editMessage(messageId, content)
  }

  const handleDeleteMessage = (messageId: string) => {
    if (confirm('Delete this message?')) {
      deleteMessage(messageId)
    }
  }

  const handleRegenerateMessage = async (messageId: string) => {
    setTypingMessageId(messageId)
    try {
      await regenerateMessage(messageId)
    } finally {
      setTypingMessageId(null)
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={cn(
      'flex h-screen transition-all duration-300',
      isFullscreen && 'fixed inset-0 z-50'
    )}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col gradient-animation">
        {/* Header */}
        <header className="glass-effect-dark px-6 py-4 flex items-center justify-between shadow-xl border-b border-white/10">
          <div className="flex items-center gap-3">
            {sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Show sidebar"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            )}
            
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover-lift">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            
            <div>
              <h1 className="font-bold text-white text-lg">
                {activeThread?.title || 'AI Assistant'}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-white/60">
                  Powered by {session?.settings.model?.replace('claude-', 'Claude ') || 'Claude'}
                </p>
                {!isOnline && (
                  <div className="flex items-center gap-1 text-red-400">
                    <WifiOff className="w-3 h-3" />
                    <span className="text-xs">Offline</span>
                  </div>
                )}
                {isOnline && (
                  <div className="flex items-center gap-1 text-green-400">
                    <Wifi className="w-3 h-3" />
                    <span className="text-xs">Online</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-32">
                <ProgressBar 
                  progress={uploadProgress} 
                  variant="gradient" 
                  size="sm" 
                  showPercentage 
                />
              </div>
            )}

            {/* Error Indicator */}
            {error && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('linear')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'linear' ? 'bg-violet-500 text-white' : 'text-white/60 hover:text-white'
                )}
                title="Linear view"
              >
                <Layout className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('threaded')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'threaded' ? 'bg-violet-500 text-white' : 'text-white/60 hover:text-white'
                )}
                title="Threaded view"
              >
                <GitBranch className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setTemplateSelectorOpen(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title="Prompt templates"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPluginManagerOpen(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title="Plugin manager"
            >
              <Puzzle className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {activeThread && activeThread.messages.length > 0 && (
              <button
                onClick={clearContext}
                className="glass-effect px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover-lift flex items-center gap-2"
                title="Clear conversation"
              >
                <span className="text-sm">Clear</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="max-w-4xl mx-auto">
            {!activeThread || activeThread.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="glass-effect rounded-3xl p-12 text-center hover-lift max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 pulse-glow">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Welcome to Claude Wrapper!
                  </h2>
                  <p className="text-white/70 mb-4">
                    Start a conversation with Claude AI. I can help you with:
                  </p>
                  <div className="space-y-2 text-sm text-white/60">
                    <p>• Answering questions and providing explanations</p>
                    <p>• Writing and editing content</p>
                    <p>• Code analysis and programming help</p>
                    <p>• Creative tasks and brainstorming</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {viewMode === 'linear' ? (
                  <>
                    {activeThread.messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isTyping={typingMessageId === message.id}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                        onRegenerate={handleRegenerateMessage}
                      />
                    ))}
                  </>
                ) : (
                  <ThreadTree
                    messages={activeThread.messages}
                    onSendMessage={sendMessage}
                    onEditMessage={handleEditMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onRegenerateMessage={handleRegenerateMessage}
                  />
                )}
                
                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="glass-effect rounded-2xl px-5 py-4 shadow-lg">
                      <LoadingSpinner variant="dots" className="text-white/70" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!isOnline}
          placeholder={
            !isOnline 
              ? "You're offline. Please check your connection..."
              : "Type your message..."
          }
        />
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />

      {/* Plugin Manager */}
      <PluginManagerComponent
        isOpen={pluginManagerOpen}
        onClose={() => setPluginManagerOpen(false)}
      />

      {/* Template Selector */}
      <TemplateSelector
        isOpen={templateSelectorOpen}
        onClose={() => setTemplateSelectorOpen(false)}
        onSelectTemplate={(template) => {
          // This would integrate with the chat input
          console.log('Selected template:', template)
        }}
        templates={templates}
      />
    </div>
  )
}