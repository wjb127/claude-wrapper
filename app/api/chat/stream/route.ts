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
    
    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await claudeApi.sendMessageStream(
            { messages, settings, stream: true },
            (chunk: string) => {
              // Send chunk to client
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`))
            },
            (fullResponse: string) => {
              // Send completion signal
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'complete', content: fullResponse })}\n\n`))
              controller.close()
            },
            (error: ClaudeApiError) => {
              // Send error signal
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`))
              controller.close()
            }
          )
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'error', error: 'Stream failed' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Stream API error:', error)
    
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