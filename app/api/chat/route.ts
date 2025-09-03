import { NextResponse } from 'next/server'
import { ClaudeApi, ClaudeApiError } from '@/lib/claude-api'

export async function POST(request: Request) {
  try {
    const { messages, settings = {} } = await request.json()

    if (!process.env.CLAUDE_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'API key not configured' 
      }, { status: 500 })
    }

    const claudeApi = new ClaudeApi({ apiKey: process.env.CLAUDE_API_KEY })
    
    const response = await claudeApi.sendMessage({
      messages,
      settings,
      stream: false
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof ClaudeApiError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      }, { status: error.statusCode || 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}