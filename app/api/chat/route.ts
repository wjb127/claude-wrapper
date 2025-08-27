import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { messages, conversationId } = await request.json()
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: messages.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      })
    })

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text()
      console.error('Claude API error:', error)
      return NextResponse.json({ error: 'Claude API error' }, { status: 500 })
    }

    const data = await claudeResponse.json()
    
    if (conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: messages[messages.length - 1].content
      })
      
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: data.content[0].text
      })
      
      await supabase.from('conversations').update({
        updated_at: new Date().toISOString()
      }).eq('id', conversationId)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}