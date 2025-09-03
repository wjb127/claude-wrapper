import { Message, ChatSettings, ApiResponse } from '@/types/chat'

export interface ClaudeApiOptions {
  apiKey: string
  baseUrl?: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

export interface SendMessageRequest {
  messages: Array<{ role: string; content: string }>
  settings: Partial<ChatSettings>
  stream?: boolean
}

export class ClaudeApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ClaudeApiError'
  }
}

export class ClaudeApi {
  private options: Required<ClaudeApiOptions>

  constructor(options: ClaudeApiOptions) {
    this.options = {
      baseUrl: 'https://api.anthropic.com/v1',
      timeout: 60000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...options
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<ApiResponse> {
    const startTime = Date.now()
    
    try {
      const response = await this.makeRequest('/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.options.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.settings.model || 'claude-3-5-sonnet-20241022',
          max_tokens: request.settings.maxTokens || 4000,
          temperature: request.settings.temperature || 0.7,
          system: request.settings.systemPrompt,
          messages: request.messages,
          stream: request.stream || false
        })
      })

      const data = await response.json()
      const duration = Date.now() - startTime

      if (!response.ok) {
        throw new ClaudeApiError(
          data.error?.message || 'API request failed',
          response.status,
          data.error?.type,
          data.error
        )
      }

      return {
        success: true,
        data,
        metadata: {
          model: request.settings.model || 'claude-3-5-sonnet-20241022',
          tokens: data.usage?.output_tokens || 0,
          duration
        }
      }
    } catch (error) {
      if (error instanceof ClaudeApiError) {
        throw error
      }
      
      throw new ClaudeApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        'NETWORK_ERROR',
        error
      )
    }
  }

  async sendMessageStream(
    request: SendMessageRequest,
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: ClaudeApiError) => void
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      const response = await this.makeRequest('/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.options.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.settings.model || 'claude-3-5-sonnet-20241022',
          max_tokens: request.settings.maxTokens || 4000,
          temperature: request.settings.temperature || 0.7,
          system: request.settings.systemPrompt,
          messages: request.messages,
          stream: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new ClaudeApiError(
          errorData.error?.message || 'API request failed',
          response.status,
          errorData.error?.type,
          errorData.error
        )
      }

      const reader = response.body?.getReader()
      if (!reader) throw new ClaudeApiError('No response body')

      let fullResponse = ''
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                onComplete(fullResponse)
                return
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  const text = parsed.delta.text
                  fullResponse += text
                  onChunk(text)
                }
              } catch (e) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      onComplete(fullResponse)
    } catch (error) {
      if (error instanceof ClaudeApiError) {
        onError(error)
      } else {
        onError(new ClaudeApiError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          undefined,
          'STREAM_ERROR',
          error
        ))
      }
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const url = `${this.options.baseUrl}${endpoint}`
    
    for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout)
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return response
        }
        
        // Retry on server errors (5xx) or network errors
        if (response.ok || attempt === this.options.retryAttempts) {
          return response
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay * attempt))
      } catch (error) {
        if (attempt === this.options.retryAttempts) {
          throw error
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay * attempt))
      }
    }
    
    throw new Error('Max retry attempts reached')
  }

  // Utility methods
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.options.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      })
      
      return response.ok
    } catch {
      return false
    }
  }

  async getModels(): Promise<string[]> {
    // Claude API doesn't have a models endpoint, so return available models
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307'
    ]
  }
}

// Singleton instance
let apiInstance: ClaudeApi | null = null

export function getClaudeApi(): ClaudeApi {
  if (!apiInstance) {
    const apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || process.env.CLAUDE_API_KEY
    if (!apiKey) {
      throw new ClaudeApiError('Claude API key not configured')
    }
    
    apiInstance = new ClaudeApi({ apiKey })
  }
  
  return apiInstance
}

export function setClaudeApiKey(apiKey: string): void {
  apiInstance = new ClaudeApi({ apiKey })
}