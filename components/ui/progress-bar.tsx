'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number // 0-100
  variant?: 'default' | 'gradient' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showPercentage?: boolean
}

export function ProgressBar({
  progress,
  variant = 'default',
  size = 'md',
  className,
  showPercentage = false
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const variantClasses = {
    default: 'bg-violet-500',
    gradient: 'bg-gradient-to-r from-violet-500 to-purple-600',
    pulse: 'bg-violet-500 animate-pulse'
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'w-full bg-gray-700 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            variantClasses[variant]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-gray-400 mt-1 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}