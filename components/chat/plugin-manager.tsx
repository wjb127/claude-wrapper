'use client'

import { useState, useEffect } from 'react'
import { PluginManager, Plugin } from '@/lib/plugin-system'
import { PromptTemplatesPlugin } from '@/lib/plugins/prompt-templates'
import { AutoTranslatorPlugin } from '@/lib/plugins/auto-translator'
import { 
  Puzzle, 
  Power, 
  PowerOff, 
  Settings, 
  Download, 
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PluginManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function PluginManagerComponent({ isOpen, onClose }: PluginManagerProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [enabledPlugins, setEnabledPlugins] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [pluginSettings, setPluginSettings] = useState<Record<string, any>>({})

  const pluginManager = PluginManager.getInstance()

  useEffect(() => {
    loadPlugins()
  }, [])

  const loadPlugins = async () => {
    try {
      // Register built-in plugins
      const promptTemplatesPlugin = new PromptTemplatesPlugin()
      const autoTranslatorPlugin = new AutoTranslatorPlugin()

      await pluginManager.registerPlugin(promptTemplatesPlugin)
      await pluginManager.registerPlugin(autoTranslatorPlugin)

      // Load plugin states
      const allPlugins = pluginManager.getAllPlugins()
      setPlugins(allPlugins)

      const enabled = new Set<string>()
      allPlugins.forEach(plugin => {
        if (pluginManager.isPluginEnabled(plugin.manifest.id)) {
          enabled.add(plugin.manifest.id)
        }
      })
      setEnabledPlugins(enabled)
    } catch (error) {
      console.error('Failed to load plugins:', error)
    }
  }

  const togglePlugin = async (pluginId: string) => {
    try {
      if (enabledPlugins.has(pluginId)) {
        await pluginManager.disablePlugin(pluginId)
        setEnabledPlugins(prev => {
          const newSet = new Set(prev)
          newSet.delete(pluginId)
          return newSet
        })
      } else {
        await pluginManager.enablePlugin(pluginId)
        setEnabledPlugins(prev => new Set(prev).add(pluginId))
      }
    } catch (error) {
      console.error('Failed to toggle plugin:', error)
    }
  }

  const updatePluginSetting = async (pluginId: string, key: string, value: any) => {
    try {
      const currentSettings = pluginManager.getPluginSettings(pluginId)
      const newSettings = { ...currentSettings, [key]: value }
      
      await pluginManager.updatePluginSettings(pluginId, newSettings)
      setPluginSettings(prev => ({
        ...prev,
        [pluginId]: newSettings
      }))
    } catch (error) {
      console.error('Failed to update plugin settings:', error)
    }
  }

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.manifest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.manifest.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (categoryFilter === 'all') return matchesSearch
    if (categoryFilter === 'enabled') return matchesSearch && enabledPlugins.has(plugin.manifest.id)
    if (categoryFilter === 'disabled') return matchesSearch && !enabledPlugins.has(plugin.manifest.id)
    
    return matchesSearch
  })

  const categories = ['all', 'enabled', 'disabled']

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Puzzle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Plugin Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Plugin List */}
          <div className="w-1/2 border-r border-white/10">
            {/* Search and Filter */}
            <div className="p-4 border-b border-white/10">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search plugins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-sm transition-colors',
                      categoryFilter === category
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                    )}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Plugin List */}
            <div className="overflow-y-auto h-full p-4 space-y-3">
              {filteredPlugins.map(plugin => {
                const isEnabled = enabledPlugins.has(plugin.manifest.id)
                const isSelected = selectedPlugin?.manifest.id === plugin.manifest.id

                return (
                  <div
                    key={plugin.manifest.id}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                      isSelected
                        ? 'border-violet-500 bg-violet-500/20'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    )}
                    onClick={() => setSelectedPlugin(plugin)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{plugin.manifest.icon || '🔌'}</div>
                        <div>
                          <h3 className="text-white font-medium">{plugin.manifest.name}</h3>
                          <p className="text-white/60 text-sm mt-1">{plugin.manifest.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-white/50">v{plugin.manifest.version}</span>
                            <span className="text-xs text-white/50">by {plugin.manifest.author}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePlugin(plugin.manifest.id)
                        }}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          isEnabled
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        )}
                        title={isEnabled ? 'Disable plugin' : 'Enable plugin'}
                      >
                        {isEnabled ? (
                          <Power className="w-4 h-4" />
                        ) : (
                          <PowerOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}

              {filteredPlugins.length === 0 && (
                <div className="text-center text-white/50 py-12">
                  <Puzzle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No plugins found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filter</p>
                </div>
              )}
            </div>
          </div>

          {/* Plugin Details */}
          <div className="w-1/2 overflow-y-auto">
            {selectedPlugin ? (
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-4xl">{selectedPlugin.manifest.icon || '🔌'}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedPlugin.manifest.name}</h3>
                    <p className="text-white/70 mt-1">{selectedPlugin.manifest.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                      <span>Version {selectedPlugin.manifest.version}</span>
                      <span>by {selectedPlugin.manifest.author}</span>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Permissions</h4>
                  <div className="space-y-2">
                    {selectedPlugin.manifest.permissions.map((permission, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <span className="text-white/80 font-medium">{permission.type}</span>
                          <p className="text-white/60">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                {selectedPlugin.manifest.settings && selectedPlugin.manifest.settings.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3">Settings</h4>
                    <div className="space-y-4">
                      {selectedPlugin.manifest.settings.map(setting => {
                        const currentValue = pluginManager.getPluginSettings(selectedPlugin.manifest.id)[setting.key] ?? setting.default

                        return (
                          <div key={setting.key}>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              {setting.name}
                              {setting.required && <span className="text-red-400 ml-1">*</span>}
                            </label>
                            
                            {setting.type === 'boolean' ? (
                              <button
                                onClick={() => updatePluginSetting(selectedPlugin.manifest.id, setting.key, !currentValue)}
                                className={cn(
                                  'relative w-12 h-6 rounded-full transition-colors',
                                  currentValue ? 'bg-violet-500' : 'bg-gray-600'
                                )}
                              >
                                <div className={cn(
                                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                                  currentValue ? 'translate-x-7' : 'translate-x-1'
                                )} />
                              </button>
                            ) : setting.type === 'select' ? (
                              <select
                                value={currentValue}
                                onChange={(e) => updatePluginSetting(selectedPlugin.manifest.id, setting.key, e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                              >
                                {setting.options?.map(option => (
                                  <option key={option.value} value={option.value} className="bg-gray-800">
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : setting.type === 'number' ? (
                              <input
                                type="number"
                                value={currentValue}
                                onChange={(e) => updatePluginSetting(selectedPlugin.manifest.id, setting.key, parseFloat(e.target.value))}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => updatePluginSetting(selectedPlugin.manifest.id, setting.key, e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                              />
                            )}
                            
                            <p className="text-xs text-white/60 mt-1">{setting.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => togglePlugin(selectedPlugin.manifest.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                      enabledPlugins.has(selectedPlugin.manifest.id)
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    )}
                  >
                    {enabledPlugins.has(selectedPlugin.manifest.id) ? (
                      <>
                        <PowerOff className="w-4 h-4" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        Enable
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/60">
                <Puzzle className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Plugin</h3>
                <p className="text-sm text-center">
                  Choose a plugin from the list to view details and configure settings
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              {plugins.length} plugins • {enabledPlugins.size} enabled
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
                Install Plugin
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-all duration-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}