import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatContainer } from '@/components/chat/chat-container'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return <ChatContainer />
}