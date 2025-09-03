'use client'

import { useState, useEffect } from 'react'
import { PromptTemplate, PromptVariable } from '@/lib/plugins/prompt-templates'
import { Search, FileText, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (renderedTemplate: string) => void
  templates: PromptTemplate[]
}

export function TemplateSelector({ 
  isOpen, 
  onClose, 
  onSelectTemplate, 
  templates 
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({})

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    
    // Initialize variables with defaults
    const initialVariables: Record<string, any> = {}
    template.variables.forEach(variable => {
      initialVariables[variable.name] = variable.default || ''
    })
    setTemplateVariables(initialVariables)
  }

  const handleVariableChange = (variableName: string, value: any) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variableName]: value
    }))
  }

  const renderTemplate = (template: PromptTemplate, variables: Record<string, any>): string => {
    let rendered = template.template

    // Replace variables
    template.variables.forEach(variable => {
      const value = variables[variable.name] || variable.default || ''
      const pattern = new RegExp(`{{${variable.name}}}`, 'g')
      rendered = rendered.replace(pattern, String(value))
    })

    // Handle conditional blocks
    rendered = rendered.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, varName, content) => {
      const value = variables[varName]
      return value ? content : ''
    })

    return rendered
  }

  const handleUseTemplate = () => {
    if (!selectedTemplate) return
    
    const rendered = renderTemplate(selectedTemplate, templateVariables)
    onSelectTemplate(rendered)
    onClose()
  }

  const renderVariableInput = (variable: PromptVariable) => {
    const value = templateVariables[variable.name] || variable.default || ''

    switch (variable.type) {
      case 'multiline':
        return (
          <textarea
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-violet-500 min-h-[80px]"
            placeholder={variable.description}
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, parseFloat(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-violet-500"
            placeholder={variable.description}
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="" className="bg-gray-800">Select...</option>
            {variable.options?.map(option => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
        )
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-violet-500"
            placeholder={variable.description}
          />
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Prompt Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Template List */}
          <div className="w-1/2 border-r border-white/10">
            {/* Search and Filter */}
            <div className="p-4 border-b border-white/10">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-sm transition-colors',
                      selectedCategory === category
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                    )}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Template List */}
            <div className="overflow-y-auto h-full p-4 space-y-3">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                    selectedTemplate?.id === template.id
                      ? 'border-violet-500 bg-violet-500/20'
                      : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                  )}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <h3 className="text-white font-medium">{template.name}</h3>
                  <p className="text-white/60 text-sm mt-1">{template.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                      {template.category}
                    </span>
                    {template.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-white/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-center text-white/50 py-12">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No templates found</p>
                  <p className="text-sm mt-1">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          </div>

          {/* Template Configuration */}
          <div className="w-1/2 overflow-y-auto">
            {selectedTemplate ? (
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">{selectedTemplate.name}</h3>
                
                {/* Variables */}
                <div className="space-y-4 mb-6">
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable.name}>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        {variable.description}
                        {variable.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {renderVariableInput(variable)}
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Preview</h4>
                  <div className="bg-black/20 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <pre className="text-white/80 text-sm whitespace-pre-wrap">
                      {renderTemplate(selectedTemplate, templateVariables)}
                    </pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={handleUseTemplate}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4" />
                    Use Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/60">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Template</h3>
                <p className="text-sm text-center">
                  Choose a template from the list to configure and use it
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}