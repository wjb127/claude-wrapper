import { Plugin, PluginManifest, PluginHooks, PluginContext } from '@/lib/plugin-system'
import { Message } from '@/types/chat'

export class AutoTranslatorPlugin extends Plugin {
  manifest: PluginManifest = {
    id: 'auto-translator',
    name: 'Auto Translator',
    version: '1.0.0',
    description: 'Automatically translate messages between languages',
    author: 'Claude Wrapper Team',
    icon: '🌐',
    permissions: [
      {
        type: 'read_messages',
        description: 'Read messages to detect language'
      },
      {
        type: 'modify_messages',
        description: 'Add translations to messages'
      },
      {
        type: 'network_access',
        description: 'Access translation services'
      }
    ],
    settings: [
      {
        key: 'autoDetect',
        name: 'Auto Detect Language',
        type: 'boolean',
        description: 'Automatically detect message language',
        default: true
      },
      {
        key: 'targetLanguage',
        name: 'Target Language',
        type: 'select',
        description: 'Language to translate to',
        default: 'ko',
        options: [
          { label: '한국어', value: 'ko' },
          { label: 'English', value: 'en' },
          { label: '日本語', value: 'ja' },
          { label: '中文', value: 'zh' },
          { label: 'Español', value: 'es' },
          { label: 'Français', value: 'fr' },
          { label: 'Deutsch', value: 'de' }
        ]
      },
      {
        key: 'translateUserMessages',
        name: 'Translate User Messages',
        type: 'boolean',
        description: 'Translate user messages to target language',
        default: false
      },
      {
        key: 'translateAssistantMessages',
        name: 'Translate Assistant Messages',
        type: 'boolean',
        description: 'Translate assistant messages to target language',
        default: true
      },
      {
        key: 'showOriginal',
        name: 'Show Original Text',
        type: 'boolean',
        description: 'Show original text alongside translation',
        default: true
      }
    ]
  }

  hooks: PluginHooks = {
    beforeSendMessage: this.beforeSendMessage.bind(this),
    afterReceiveMessage: this.afterReceiveMessage.bind(this)
  }

  async beforeSendMessage(content: string, context: PluginContext): Promise<string | null> {
    const translateUserMessages = this.getSetting('translateUserMessages', false)
    if (!translateUserMessages) return null

    const targetLanguage = this.getSetting('targetLanguage', 'ko')
    const detectedLanguage = await this.detectLanguage(content)
    
    if (detectedLanguage === targetLanguage) return null

    try {
      const translation = await this.translateText(content, detectedLanguage, targetLanguage)
      const showOriginal = this.getSetting('showOriginal', true)
      
      if (showOriginal) {
        return `${translation}\n\n---\n*Original (${detectedLanguage}):* ${content}`
      } else {
        return translation
      }
    } catch (error) {
      console.error('Translation failed:', error)
      return null
    }
  }

  async afterReceiveMessage(message: Message, context: PluginContext): Promise<Message> {
    if (message.role !== 'assistant') return message

    const translateAssistantMessages = this.getSetting('translateAssistantMessages', true)
    if (!translateAssistantMessages) return message

    const targetLanguage = this.getSetting('targetLanguage', 'ko')
    const detectedLanguage = await this.detectLanguage(message.content)
    
    if (detectedLanguage === targetLanguage) return message

    try {
      const translation = await this.translateText(message.content, detectedLanguage, targetLanguage)
      const showOriginal = this.getSetting('showOriginal', true)
      
      let translatedContent = translation
      if (showOriginal) {
        translatedContent = `${translation}\n\n---\n*Original (${detectedLanguage}):* ${message.content}`
      }

      return {
        ...message,
        content: translatedContent,
        metadata: {
          ...message.metadata,
          originalContent: message.content,
          originalLanguage: detectedLanguage,
          translatedLanguage: targetLanguage
        }
      }
    } catch (error) {
      console.error('Translation failed:', error)
      return message
    }
  }

  private async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on character patterns
    // In a real implementation, you'd use a proper language detection library
    
    const koreanPattern = /[ㄱ-ㅎ가-힣]/
    const japanesePattern = /[ひらがなカタカナ一-龯]/
    const chinesePattern = /[\u4e00-\u9fff]/
    
    if (koreanPattern.test(text)) return 'ko'
    if (japanesePattern.test(text)) return 'ja'
    if (chinesePattern.test(text)) return 'zh'
    
    return 'en' // Default to English
  }

  private async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    // This is a placeholder implementation
    // In a real application, you'd integrate with translation services like:
    // - Google Translate API
    // - DeepL API
    // - Azure Translator
    // - Or use Claude itself for translation
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          from: fromLang,
          to: toLang
        })
      })
      
      if (!response.ok) throw new Error('Translation service unavailable')
      
      const data = await response.json()
      return data.translatedText || text
    } catch (error) {
      // Fallback: Use Claude for translation
      return this.translateWithClaude(text, fromLang, toLang)
    }
  }

  private async translateWithClaude(text: string, fromLang: string, toLang: string): Promise<string> {
    const languageNames = {
      ko: '한국어',
      en: 'English',
      ja: '日本語',
      zh: '中文',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch'
    }

    const prompt = `Please translate the following text from ${languageNames[fromLang as keyof typeof languageNames] || fromLang} to ${languageNames[toLang as keyof typeof languageNames] || toLang}. Only provide the translation, no additional commentary:

${text}`

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          settings: {
            model: 'claude-3-haiku-20240307', // Use faster model for translations
            temperature: 0.3,
            maxTokens: 2000
          }
        })
      })

      if (!response.ok) throw new Error('Claude translation failed')

      const data = await response.json()
      return data.data?.content?.[0]?.text || text
    } catch (error) {
      console.error('Claude translation failed:', error)
      return text
    }
  }

  // Public methods for manual translation
  async translateMessage(messageId: string, targetLanguage: string): Promise<string> {
    // This would be called from the UI to manually translate a specific message
    // Implementation would be similar to the automatic translation
    return ''
  }

  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'ko', name: '한국어' },
      { code: 'en', name: 'English' },
      { code: 'ja', name: '日本語' },
      { code: 'zh', name: '中文' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' }
    ]
  }
}