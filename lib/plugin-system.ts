import { Message, ChatSettings } from '@/types/chat'

export interface PluginContext {
  messages: Message[]
  settings: ChatSettings
  activeThreadId: string | null
  sessionId: string | null
}

export interface PluginHooks {
  beforeSendMessage?: (content: string, context: PluginContext) => Promise<string | null>
  afterReceiveMessage?: (message: Message, context: PluginContext) => Promise<Message>
  onMessageEdit?: (messageId: string, newContent: string, context: PluginContext) => Promise<void>
  onThreadCreate?: (threadId: string, context: PluginContext) => Promise<void>
  onSettingsChange?: (newSettings: Partial<ChatSettings>, context: PluginContext) => Promise<void>
}

export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  icon?: string
  permissions: PluginPermission[]
  settings?: PluginSetting[]
}

export interface PluginPermission {
  type: 'read_messages' | 'modify_messages' | 'access_files' | 'network_access' | 'storage_access'
  description: string
}

export interface PluginSetting {
  key: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'select'
  description: string
  default: any
  options?: Array<{ label: string; value: any }>
  required?: boolean
}

export abstract class Plugin {
  abstract manifest: PluginManifest
  abstract hooks: PluginHooks
  
  protected settings: Record<string, any> = {}
  
  constructor(settings: Record<string, any> = {}) {
    this.settings = settings
  }

  // Plugin lifecycle methods
  async onInstall(): Promise<void> {
    // Override in subclass if needed
  }

  async onUninstall(): Promise<void> {
    // Override in subclass if needed
  }

  async onEnable(): Promise<void> {
    // Override in subclass if needed
  }

  async onDisable(): Promise<void> {
    // Override in subclass if needed
  }

  // Utility methods for plugins
  protected getSetting<T>(key: string, defaultValue?: T): T {
    return this.settings[key] ?? defaultValue
  }

  protected setSetting(key: string, value: any): void {
    this.settings[key] = value
  }
}

export class PluginManager {
  private static instance: PluginManager
  private plugins: Map<string, Plugin> = new Map()
  private enabledPlugins: Set<string> = new Set()
  private context: PluginContext | null = null

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager()
    }
    return PluginManager.instance
  }

  setContext(context: PluginContext): void {
    this.context = context
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    try {
      await plugin.onInstall()
      this.plugins.set(plugin.manifest.id, plugin)
      console.log(`Plugin ${plugin.manifest.name} registered successfully`)
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.manifest.id}:`, error)
      throw error
    }
  }

  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return

    try {
      await this.disablePlugin(pluginId)
      await plugin.onUninstall()
      this.plugins.delete(pluginId)
      console.log(`Plugin ${plugin.manifest.name} unregistered successfully`)
    } catch (error) {
      console.error(`Failed to unregister plugin ${pluginId}:`, error)
      throw error
    }
  }

  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`)

    try {
      await plugin.onEnable()
      this.enabledPlugins.add(pluginId)
      console.log(`Plugin ${plugin.manifest.name} enabled`)
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginId}:`, error)
      throw error
    }
  }

  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return

    try {
      await plugin.onDisable()
      this.enabledPlugins.delete(pluginId)
      console.log(`Plugin ${plugin.manifest.name} disabled`)
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error)
      throw error
    }
  }

  // Hook execution methods
  async executeBeforeSendMessage(content: string): Promise<string> {
    if (!this.context) return content

    let modifiedContent = content

    for (const [pluginId, plugin] of this.plugins) {
      if (!this.enabledPlugins.has(pluginId) || !plugin.hooks.beforeSendMessage) continue

      try {
        const result = await plugin.hooks.beforeSendMessage(modifiedContent, this.context)
        if (result !== null) {
          modifiedContent = result
        }
      } catch (error) {
        console.error(`Plugin ${pluginId} beforeSendMessage hook failed:`, error)
      }
    }

    return modifiedContent
  }

  async executeAfterReceiveMessage(message: Message): Promise<Message> {
    if (!this.context) return message

    let modifiedMessage = message

    for (const [pluginId, plugin] of this.plugins) {
      if (!this.enabledPlugins.has(pluginId) || !plugin.hooks.afterReceiveMessage) continue

      try {
        modifiedMessage = await plugin.hooks.afterReceiveMessage(modifiedMessage, this.context)
      } catch (error) {
        console.error(`Plugin ${pluginId} afterReceiveMessage hook failed:`, error)
      }
    }

    return modifiedMessage
  }

  async executeOnMessageEdit(messageId: string, newContent: string): Promise<void> {
    if (!this.context) return

    for (const [pluginId, plugin] of this.plugins) {
      if (!this.enabledPlugins.has(pluginId) || !plugin.hooks.onMessageEdit) continue

      try {
        await plugin.hooks.onMessageEdit(messageId, newContent, this.context)
      } catch (error) {
        console.error(`Plugin ${pluginId} onMessageEdit hook failed:`, error)
      }
    }
  }

  async executeOnThreadCreate(threadId: string): Promise<void> {
    if (!this.context) return

    for (const [pluginId, plugin] of this.plugins) {
      if (!this.enabledPlugins.has(pluginId) || !plugin.hooks.onThreadCreate) continue

      try {
        await plugin.hooks.onThreadCreate(threadId, this.context)
      } catch (error) {
        console.error(`Plugin ${pluginId} onThreadCreate hook failed:`, error)
      }
    }
  }

  async executeOnSettingsChange(newSettings: Partial<ChatSettings>): Promise<void> {
    if (!this.context) return

    for (const [pluginId, plugin] of this.plugins) {
      if (!this.enabledPlugins.has(pluginId) || !plugin.hooks.onSettingsChange) continue

      try {
        await plugin.hooks.onSettingsChange(newSettings, this.context)
      } catch (error) {
        console.error(`Plugin ${pluginId} onSettingsChange hook failed:`, error)
      }
    }
  }

  // Plugin management methods
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(plugin => 
      this.enabledPlugins.has(plugin.manifest.id)
    )
  }

  isPluginEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId)
  }

  getPluginSettings(pluginId: string): Record<string, any> {
    const plugin = this.plugins.get(pluginId)
    return plugin ? plugin['settings'] : {}
  }

  async updatePluginSettings(pluginId: string, settings: Record<string, any>): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`)

    plugin['settings'] = { ...plugin['settings'], ...settings }
    
    // Save to localStorage
    const allPluginSettings = this.getAllPluginSettings()
    allPluginSettings[pluginId] = plugin['settings']
    localStorage.setItem('claude-wrapper-plugin-settings', JSON.stringify(allPluginSettings))
  }

  private getAllPluginSettings(): Record<string, Record<string, any>> {
    try {
      const stored = localStorage.getItem('claude-wrapper-plugin-settings')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }
}