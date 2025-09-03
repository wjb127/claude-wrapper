import { ChatSession, ChatThread, Message } from '@/types/chat'

export class ChatStorage {
  private static instance: ChatStorage
  private readonly STORAGE_KEY = 'claude-wrapper-sessions'
  private readonly SESSION_KEY = 'claude-wrapper-active-session'

  static getInstance(): ChatStorage {
    if (!ChatStorage.instance) {
      ChatStorage.instance = new ChatStorage()
    }
    return ChatStorage.instance
  }

  // Session management
  async saveSession(session: ChatSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions()
      const existingIndex = sessions.findIndex(s => s.id === session.id)
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = { ...session, updatedAt: new Date() }
      } else {
        sessions.push(session)
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions))
      localStorage.setItem(this.SESSION_KEY, session.id)
    } catch (error) {
      console.error('Failed to save session:', error)
      throw new Error('Failed to save session')
    }
  }

  async loadSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const sessions = await this.getAllSessions()
      return sessions.find(s => s.id === sessionId) || null
    } catch (error) {
      console.error('Failed to load session:', error)
      return null
    }
  }

  async getActiveSessionId(): Promise<string | null> {
    try {
      return localStorage.getItem(this.SESSION_KEY)
    } catch (error) {
      console.error('Failed to get active session ID:', error)
      return null
    }
  }

  async getAllSessions(): Promise<ChatSession[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const sessions = JSON.parse(stored)
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        threads: session.threads.map((thread: any) => ({
          ...thread,
          createdAt: new Date(thread.createdAt),
          updatedAt: new Date(thread.updatedAt),
          messages: thread.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
      }))
    } catch (error) {
      console.error('Failed to get all sessions:', error)
      return []
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions()
      const filtered = sessions.filter(s => s.id !== sessionId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
      
      const activeSessionId = await this.getActiveSessionId()
      if (activeSessionId === sessionId) {
        localStorage.removeItem(this.SESSION_KEY)
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      throw new Error('Failed to delete session')
    }
  }

  // Thread management
  async saveThread(sessionId: string, thread: ChatThread): Promise<void> {
    try {
      const session = await this.loadSession(sessionId)
      if (!session) throw new Error('Session not found')
      
      const existingIndex = session.threads.findIndex(t => t.id === thread.id)
      if (existingIndex >= 0) {
        session.threads[existingIndex] = { ...thread, updatedAt: new Date() }
      } else {
        session.threads.push(thread)
      }
      
      await this.saveSession(session)
    } catch (error) {
      console.error('Failed to save thread:', error)
      throw new Error('Failed to save thread')
    }
  }

  async deleteThread(sessionId: string, threadId: string): Promise<void> {
    try {
      const session = await this.loadSession(sessionId)
      if (!session) throw new Error('Session not found')
      
      session.threads = session.threads.filter(t => t.id !== threadId)
      await this.saveSession(session)
    } catch (error) {
      console.error('Failed to delete thread:', error)
      throw new Error('Failed to delete thread')
    }
  }

  // Export/Import functionality
  async exportSession(sessionId: string): Promise<string> {
    try {
      const session = await this.loadSession(sessionId)
      if (!session) throw new Error('Session not found')
      
      return JSON.stringify(session, null, 2)
    } catch (error) {
      console.error('Failed to export session:', error)
      throw new Error('Failed to export session')
    }
  }

  async importSession(sessionData: string): Promise<ChatSession> {
    try {
      const session = JSON.parse(sessionData) as ChatSession
      
      // Validate session structure
      if (!session.id || !session.threads || !Array.isArray(session.threads)) {
        throw new Error('Invalid session data format')
      }
      
      // Generate new ID to avoid conflicts
      const newSession: ChatSession = {
        ...session,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await this.saveSession(newSession)
      return newSession
    } catch (error) {
      console.error('Failed to import session:', error)
      throw new Error('Failed to import session')
    }
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.SESSION_KEY)
    } catch (error) {
      console.error('Failed to clear all data:', error)
      throw new Error('Failed to clear all data')
    }
  }
}