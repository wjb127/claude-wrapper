'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'dots' | 'pulse' | 'wave'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex gap-1', className)}>
        <div className={cn('bg-current rounded-full animate-bounce', sizeClasses[size])} style={{ animationDelay: '0ms' }} />
        <div className={cn('bg-current rounded-full animate-bounce', sizeClasses[size])} style={{ animationDelay: '150ms' }} />
        <div className={cn('bg-current rounded-full animate-bounce', sizeClasses[size])} style={{ animationDelay: '300ms' }} />
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('bg-current rounded-full animate-pulse', sizeClasses[size], className)} />
    )
  }

  if (variant === 'wave') {
    return (
      <div className={cn('flex gap-1', className)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 bg-current animate-pulse"
            style={{
              height: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px',
              animationDelay: `${i * 100}ms`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  )
}