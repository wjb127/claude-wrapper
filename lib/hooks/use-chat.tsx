'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { ChatSession, ChatThread, Message, ChatSettings, ChatContextValue, SendMessageOptions } from '@/types/chat'
import { ChatStorage } from '@/lib/chat-storage'

// Default settings
const DEFAULT_SETTINGS: ChatSettings = {
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 4000,
  systemPrompt: 'You are Claude, a helpful AI assistant created by Anthropic.',
  language: 'ko',
  theme: 'auto',
  typingSpeed: 50,
  autoSave: true,
  contextWindow: 20
}

// Chat state
interface ChatState {
  session: ChatSession | null
  activeThread: ChatThread | null
  isLoading: boolean
  error: string | null
}

// Actions
type ChatAction =
  | { type: 'SET_SESSION'; payload: ChatSession }
  | { type: 'SET_ACTIVE_THREAD'; payload: ChatThread | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { messageId: string; content: string } }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ChatSettings> }
  | { type: 'ADD_THREAD'; payload: ChatThread }
  | { type: 'UPDATE_THREAD'; payload: { threadId: string; updates: Partial<ChatThread> } }
  | { type: 'DELETE_THREAD'; payload: string }

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload }
    
    case 'SET_ACTIVE_THREAD':
      return { ...state, activeThread: action.payload }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'ADD_MESSAGE':
      if (!state.session || !state.activeThread) return state
      
      const updatedThread = {
        ...state.activeThread,
        messages: [...state.activeThread.messages, action.payload],
        updatedAt: new Date()
      }
      
      const updatedSession = {
        ...state.session,
        threads: state.session.threads.map(t => 
          t.id === updatedThread.id ? updatedThread : t
        ),
        updatedAt: new Date()
      }
      
      return {
        ...state,
        session: updatedSession,
        activeThread: updatedThread
      }
    
    case 'UPDATE_MESSAGE':
      if (!state.session || !state.activeThread) return state
      
      const threadWithUpdatedMessage = {
        ...state.activeThread,
        messages: state.activeThread.messages.map(m =>
          m.id === action.payload.messageId
            ? { ...m, content: action.payload.content }
            : m
        ),
        updatedAt: new Date()
      }
      
      const sessionWithUpdatedMessage = {
        ...state.session,
        threads: state.session.threads.map(t =>
          t.id === threadWithUpdatedMessage.id ? threadWithUpdatedMessage : t
        ),
        updatedAt: new Date()
      }
      
      return {
        ...state,
        session: sessionWithUpdatedMessage,
        activeThread: threadWithUpdatedMessage
      }
    
    case 'DELETE_MESSAGE':
      if (!state.session || !state.activeThread) return state
      
      const threadWithoutMessage = {
        ...state.activeThread,
        messages: state.activeThread.messages.filter(m => m.id !== action.payload),
        updatedAt: new Date()
      }
      
      const sessionWithoutMessage = {
        ...state.session,
        threads: state.session.threads.map(t =>
          t.id === threadWithoutMessage.id ? threadWithoutMessage : t
        ),
        updatedAt: new Date()
      }
      
      return {
        ...state,
        session: sessionWithoutMessage,
        activeThread: threadWithoutMessage
      }
    
    case 'UPDATE_SETTINGS':
      if (!state.session) return state
      
      const sessionWithUpdatedSettings = {
        ...state.session,
        settings: { ...state.session.settings, ...action.payload },
        updatedAt: new Date()
      }
      
      return { ...state, session: sessionWithUpdatedSettings }
    
    case 'ADD_THREAD':
      if (!state.session) return state
      
      const sessionWithNewThread = {
        ...state.session,
        threads: [...state.session.threads, action.payload],
        activeThreadId: action.payload.id,
        updatedAt: new Date()
      }
      
      return {
        ...state,
        session: sessionWithNewThread,
        activeThread: action.payload
      }
    
    case 'UPDATE_THREAD':
      if (!state.session) return state
      
      const sessionWithUpdatedThread = {
        ...state.session,
        threads: state.session.threads.map(t =>
          t.id === action.payload.threadId
            ? { ...t, ...action.payload.updates, updatedAt: new Date() }
            : t
        ),
        updatedAt: new Date()
      }
      
      const updatedActiveThread = state.activeThread?.id === action.payload.threadId
        ? { ...state.activeThread, ...action.payload.updates, updatedAt: new Date() }
        : state.activeThread
      
      return {
        ...state,
        session: sessionWithUpdatedThread,
        activeThread: updatedActiveThread
      }
    
    case 'DELETE_THREAD':
      if (!state.session) return state
      
      const remainingThreads = state.session.threads.filter(t => t.id !== action.payload)
      const newActiveThread = state.activeThread?.id === action.payload
        ? remainingThreads[0] || null
        : state.activeThread
      
      const sessionWithoutThread = {
        ...state.session,
        threads: remainingThreads,
        activeThreadId: newActiveThread?.id || null,
        updatedAt: new Date()
      }
      
      return {
        ...state,
        session: sessionWithoutThread,
        activeThread: newActiveThread
      }
    
    default:
      return state
  }
}

// Context
const ChatContext = createContext<ChatContextValue | null>(null)

// Provider
export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, {
    session: null,
    activeThread: null,
    isLoading: false,
    error: null
  })

  const storage = ChatStorage.getInstance()

  // Initialize session on mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Auto-save when session changes
  useEffect(() => {
    if (state.session && state.session.settings.autoSave) {
      storage.saveSession(state.session).catch(console.error)
    }
  }, [state.session])

  const initializeSession = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const activeSessionId = await storage.getActiveSessionId()
      let session: ChatSession | null = null
      
      if (activeSessionId) {
        session = await storage.loadSession(activeSessionId)
      }
      
      if (!session) {
        await createSession()
      } else {
        dispatch({ type: 'SET_SESSION', payload: session })
        
        const activeThread = session.threads.find(t => t.id === session.activeThreadId) || session.threads[0] || null
        dispatch({ type: 'SET_ACTIVE_THREAD', payload: activeThread })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize session' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const createSession = async (): Promise<void> => {
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newSession: ChatSession = {
        id: sessionId,
        threads: [],
        activeThreadId: null,
        settings: DEFAULT_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await storage.saveSession(newSession)
      dispatch({ type: 'SET_SESSION', payload: newSession })
      
      // Create initial thread
      await createThread('New Chat')
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create session' })
    }
  }

  const loadSession = async (sessionId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const session = await storage.loadSession(sessionId)
      if (!session) throw new Error('Session not found')
      
      dispatch({ type: 'SET_SESSION', payload: session })
      
      const activeThread = session.threads.find(t => t.id === session.activeThreadId) || session.threads[0] || null
      dispatch({ type: 'SET_ACTIVE_THREAD', payload: activeThread })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load session' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const saveSession = async (): Promise<void> => {
    if (!state.session) return
    
    try {
      await storage.saveSession(state.session)
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save session' })
    }
  }

  const createThread = async (title: string = 'New Chat'): Promise<string> => {
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newThread: ChatThread = {
      id: threadId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
      tags: []
    }
    
    dispatch({ type: 'ADD_THREAD', payload: newThread })
    return threadId
  }

  const switchThread = (threadId: string): void => {
    if (!state.session) return
    
    const thread = state.session.threads.find(t => t.id === threadId)
    if (thread) {
      dispatch({ type: 'SET_ACTIVE_THREAD', payload: thread })
      
      const updatedSession = {
        ...state.session,
        activeThreadId: threadId,
        updatedAt: new Date()
      }
      dispatch({ type: 'SET_SESSION', payload: updatedSession })
    }
  }

  const deleteThread = (threadId: string): void => {
    dispatch({ type: 'DELETE_THREAD', payload: threadId })
  }

  const archiveThread = (threadId: string): void => {
    dispatch({ type: 'UPDATE_THREAD', payload: { threadId, updates: { isArchived: true } } })
  }

  const updateThreadTitle = (threadId: string, title: string): void => {
    dispatch({ type: 'UPDATE_THREAD', payload: { threadId, updates: { title } } })
  }

  const sendMessage = async (content: string, options: SendMessageOptions = {}): Promise<void> => {
    if (!state.session || !state.activeThread) return
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Create user message
      const userMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        threadId: state.activeThread.id,
        parentId: options.parentId
      }
      
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage })
      
      // Get context messages
      const contextMessages = getContextMessages(state.session.settings.contextWindow)
      const allMessages = [...contextMessages, userMessage]
      
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          settings: {
            model: state.session.settings.model,
            temperature: options.temperature ?? state.session.settings.temperature,
            maxTokens: options.maxTokens ?? state.session.settings.maxTokens,
            systemPrompt: options.systemPrompt ?? state.session.settings.systemPrompt
          }
        })
      })
      
      if (!response.ok) throw new Error('Failed to get response')
      
      const data = await response.json()
      
      if (data.content && data.content[0]) {
        const assistantMessage: Message = {
          id: `msg-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: data.content[0].text,
          timestamp: new Date(),
          threadId: state.activeThread.id,
          parentId: userMessage.id,
          metadata: {
            model: data.model,
            tokens: data.usage?.output_tokens,
            duration: data.metadata?.duration
          }
        }
        
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage })
        
        // Auto-generate thread title if it's the first exchange
        if (state.activeThread.messages.length === 0) {
          const title = generateThreadTitle(content)
          updateThreadTitle(state.activeThread.id, title)
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const editMessage = (messageId: string, content: string): void => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { messageId, content } })
  }

  const deleteMessage = (messageId: string): void => {
    dispatch({ type: 'DELETE_MESSAGE', payload: messageId })
  }

  const regenerateMessage = async (messageId: string): Promise<void> => {
    if (!state.activeThread) return
    
    const messageIndex = state.activeThread.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return
    
    const message = state.activeThread.messages[messageIndex]
    if (message.role !== 'assistant') return
    
    // Find the parent user message
    const parentMessage = state.activeThread.messages.find(m => m.id === message.parentId)
    if (!parentMessage) return
    
    // Remove the assistant message and any subsequent messages
    const messagesToKeep = state.activeThread.messages.slice(0, messageIndex)
    
    // Update thread with only the messages up to the parent
    dispatch({ type: 'UPDATE_THREAD', payload: {
      threadId: state.activeThread.id,
      updates: { messages: messagesToKeep }
    }})
    
    // Regenerate response
    await sendMessage(parentMessage.content, { parentId: parentMessage.parentId })
  }

  const updateSettings = (settings: Partial<ChatSettings>): void => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }

  const getContextMessages = (maxMessages: number = state.session?.settings.contextWindow || 20): Message[] => {
    if (!state.activeThread) return []
    
    return state.activeThread.messages.slice(-maxMessages)
  }

  const clearContext = (): void => {
    if (!state.activeThread) return
    
    dispatch({ type: 'UPDATE_THREAD', payload: {
      threadId: state.activeThread.id,
      updates: { messages: [] }
    }})
  }

  const generateThreadTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 4)
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '')
  }

  const contextValue: ChatContextValue = {
    session: state.session,
    activeThread: state.activeThread,
    isLoading: state.isLoading,
    error: state.error,
    createSession,
    loadSession,
    saveSession,
    createThread,
    switchThread,
    deleteThread,
    archiveThread,
    updateThreadTitle,
    sendMessage,
    editMessage,
    deleteMessage,
    regenerateMessage,
    updateSettings,
    getContextMessages,
    clearContext
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook
export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}