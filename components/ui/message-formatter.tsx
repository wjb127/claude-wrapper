'use client'

import { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface MessageFormatterProps {
  content: string
  className?: string
}

interface CodeBlockProps {
  children: string
  language?: string
}

function CodeBlock({ children, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
      
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          lineHeight: '1.5'
        }}
        showLineNumbers={language !== 'text' && children.split('\n').length > 5}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

export function MessageFormatter({ content, className = '' }: MessageFormatterProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            
            if (!inline && language) {
              return (
                <CodeBlock language={language}>
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
              )
            }
            
            return (
              <code
                className="bg-gray-700 text-gray-100 px-2 py-1 rounded text-sm"
                {...props}
              >
                {children}
              </code>
            )
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-violet-500 pl-4 italic text-gray-300 my-4">
                {children}
              </blockquote>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-600 rounded-lg">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border border-gray-600 px-4 py-2 bg-gray-700 text-left font-semibold">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="border border-gray-600 px-4 py-2">
                {children}
              </td>
            )
          },
          ul({ children }) {
            return (
              <ul className="list-disc list-inside space-y-1 my-4">
                {children}
              </ul>
            )
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside space-y-1 my-4">
                {children}
              </ol>
            )
          },
          li({ children }) {
            return (
              <li className="text-gray-200">
                {children}
              </li>
            )
          },
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold text-white mb-4 mt-6">
                {children}
              </h1>
            )
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-semibold text-white mb-3 mt-5">
                {children}
              </h2>
            )
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-medium text-white mb-2 mt-4">
                {children}
              </h3>
            )
          },
          p({ children }) {
            return (
              <p className="text-gray-200 leading-relaxed mb-3">
                {children}
              </p>
            )
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline transition-colors"
              >
                {children}
              </a>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}