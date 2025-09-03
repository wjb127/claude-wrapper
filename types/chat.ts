export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  threadId?: string
  parentId?: string
  metadata?: {
    model?: string
    tokens?: number
    duration?: number
    temperature?: number
  }
}

export interface ChatThread {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isArchived: boolean
  tags: string[]
  summary?: string
}

export interface ChatSession {
  id: string
  threads: ChatThread[]
  activeThreadId: string | null
  settings: ChatSettings
  createdAt: Date
  updatedAt: Date
}

export interface ChatSettings {
  model: 'claude-3-5-sonnet-20241022' | 'claude-3-opus-20240229' | 'claude-3-haiku-20240307'
  temperature: number
  maxTokens: number
  systemPrompt: string
  language: 'ko' | 'en' | 'ja' | 'zh'
  theme: 'light' | 'dark' | 'auto'
  typingSpeed: number
  autoSave: boolean
  contextWindow: number
}

export interface ChatContextValue {
  session: ChatSession | null
  activeThread: ChatThread | null
  isLoading: boolean
  error: string | null
  
  // Session management
  createSession: () => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  saveSession: () => Promise<void>
  
  // Thread management
  createThread: (title?: string) => Promise<string>
  switchThread: (threadId: string) => void
  deleteThread: (threadId: string) => void
  archiveThread: (threadId: string) => void
  updateThreadTitle: (threadId: string, title: string) => void
  
  // Message management
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>
  editMessage: (messageId: string, content: string) => void
  deleteMessage: (messageId: string) => void
  regenerateMessage: (messageId: string) => Promise<void>
  
  // Settings
  updateSettings: (settings: Partial<ChatSettings>) => void
  
  // Context management
  getContextMessages: (maxMessages?: number) => Message[]
  clearContext: () => void
}

export interface SendMessageOptions {
  parentId?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    model: string
    tokens: number
    duration: number
  }
}