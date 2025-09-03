'use client'

import { useState } from 'react'
import { ChatSettings } from '@/types/chat'
import { useChat } from '@/lib/hooks/use-chat'
import { 
  Settings, 
  X, 
  Palette, 
  Globe, 
  Zap, 
  Brain,
  MessageSquare,
  Download,
  Upload,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { session, updateSettings, saveSession } = useChat()
  const [localSettings, setLocalSettings] = useState<ChatSettings>(
    session?.settings || {} as ChatSettings
  )

  const handleSettingChange = <K extends keyof ChatSettings>(
    key: K,
    value: ChatSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    updateSettings({ [key]: value })
  }

  const handleSave = async () => {
    await saveSession()
    onClose()
  }

  const handleReset = () => {
    const defaultSettings: ChatSettings = {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 4000,
      systemPrompt: 'You are Claude, a helpful AI assistant created by Anthropic.',
      language: 'ko',
      theme: 'auto',
      typingSpeed: 50,
      autoSave: true,
      contextWindow: 20
    }
    
    setLocalSettings(defaultSettings)
    updateSettings(defaultSettings)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* AI Model Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">AI Model</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Model
                </label>
                <select
                  value={localSettings.model}
                  onChange={(e) => handleSettingChange('model', e.target.value as any)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Temperature: {localSettings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="100"
                  max="8000"
                  step="100"
                  value={localSettings.maxTokens}
                  onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  System Prompt
                </label>
                <textarea
                  value={localSettings.systemPrompt}
                  onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500 min-h-[80px]"
                  placeholder="Enter system prompt..."
                />
              </div>
            </div>
          </section>

          {/* Interface Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">Interface</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Theme
                </label>
                <select
                  value={localSettings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value as any)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Language
                </label>
                <select
                  value={localSettings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value as any)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Typing Speed: {localSettings.typingSpeed}ms
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={localSettings.typingSpeed}
                  onChange={(e) => handleSettingChange('typingSpeed', parseInt(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>Fast</span>
                  <span>Slow</span>
                </div>
              </div>
            </div>
          </section>

          {/* Chat Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">Chat</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Context Window (messages)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  step="5"
                  value={localSettings.contextWindow}
                  onChange={(e) => handleSettingChange('contextWindow', parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                />
                <p className="text-xs text-white/60 mt-1">
                  Number of recent messages to include as context
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Auto-save conversations
                  </label>
                  <p className="text-xs text-white/60">
                    Automatically save your chat history
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoSave', !localSettings.autoSave)}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    localSettings.autoSave ? 'bg-violet-500' : 'bg-gray-600'
                  )}
                >
                  <div className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    localSettings.autoSave ? 'translate-x-7' : 'translate-x-1'
                  )} />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Reset to Default
          </button>
          
          <div className="flex-1" />
          
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}