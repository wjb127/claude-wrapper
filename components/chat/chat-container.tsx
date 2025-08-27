'use client'

import { useState, useEffect, useRef } from 'react'
import { Message } from './message'
import { ChatInput } from './chat-input'
import { Sidebar } from './sidebar'

interface MessageType {
  id?: string
  role: 'user' | 'assistant'
  content: string
}


export function ChatContainer() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversation = async (conversationId: string) => {
    const response = await fetch(`/api/conversations/${conversationId}`)
    if (response.ok) {
      const data = await response.json()
      setMessages(data)
      setCurrentConversationId(conversationId)
    }
  }

  const createNewConversation = async (firstMessage: string) => {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: firstMessage.slice(0, 100) 
      }),
    })
    
    if (response.ok) {
      const conversation = await response.json()
      setCurrentConversationId(conversation.id)
      return conversation.id
    }
    return null
  }

  const handleNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: MessageType = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      let conversationId = currentConversationId
      
      if (!conversationId) {
        conversationId = await createNewConversation(content)
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      if (data.content && data.content[0]) {
        const assistantMessage: MessageType = {
          role: 'assistant',
          content: data.content[0].text,
        }
        setMessages([...newMessages, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please check your API key.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        currentConversationId={currentConversationId || undefined}
        onSelectConversation={loadConversation}
        onNewConversation={handleNewConversation}
      />
      
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <h1 className="text-2xl font-semibold mb-2">Claude Wrapper</h1>
                <p>Start a conversation</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isLoading && (
                <div className="flex gap-4 p-6 bg-gray-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}