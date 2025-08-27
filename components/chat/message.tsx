'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageProps {
  role: 'user' | 'assistant'
  content: string
}

export function Message({ role, content }: MessageProps) {
  return (
    <div className={cn(
      "flex gap-4 p-6",
      role === 'user' ? 'bg-white' : 'bg-gray-50'
    )}>
      <div className="flex-shrink-0">
        {role === 'user' ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
            <User className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
            <Bot className="h-5 w-5" />
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-2 overflow-hidden">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-sm max-w-none"
          components={{
            code({ inline, className, children, ...props }: {
              inline?: boolean
              className?: string
              children?: React.ReactNode
              [key: string]: unknown
            }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="rounded bg-gray-100 px-1 py-0.5 text-sm" {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}