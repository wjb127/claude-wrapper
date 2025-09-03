import { Plugin, PluginManifest, PluginHooks } from '@/lib/plugin-system'

export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: string
  template: string
  variables: PromptVariable[]
  language: string
  tags: string[]
}

export interface PromptVariable {
  name: string
  description: string
  type: 'text' | 'number' | 'select' | 'multiline'
  required: boolean
  default?: any
  options?: Array<{ label: string; value: any }>
}

export class PromptTemplatesPlugin extends Plugin {
  manifest: PluginManifest = {
    id: 'prompt-templates',
    name: 'Prompt Templates',
    version: '1.0.0',
    description: 'Provides customizable prompt templates for common tasks',
    author: 'Claude Wrapper Team',
    icon: '📝',
    permissions: [
      {
        type: 'read_messages',
        description: 'Read messages to apply templates'
      },
      {
        type: 'modify_messages',
        description: 'Modify messages with template content'
      }
    ],
    settings: [
      {
        key: 'defaultLanguage',
        name: 'Default Language',
        type: 'select',
        description: 'Default language for templates',
        default: 'ko',
        options: [
          { label: '한국어', value: 'ko' },
          { label: 'English', value: 'en' },
          { label: '日本語', value: 'ja' },
          { label: '中文', value: 'zh' }
        ]
      },
      {
        key: 'autoSuggest',
        name: 'Auto Suggest Templates',
        type: 'boolean',
        description: 'Automatically suggest relevant templates',
        default: true
      }
    ]
  }

  hooks: PluginHooks = {
    beforeSendMessage: this.beforeSendMessage.bind(this)
  }

  private templates: PromptTemplate[] = [
    {
      id: 'code-review',
      name: 'Code Review',
      description: 'Review code for best practices and improvements',
      category: 'Development',
      template: `다음 {{language}} 코드를 리뷰해주세요:

\`\`\`{{language}}
{{code}}
\`\`\`

다음 관점에서 검토해주세요:
- 코드 품질 및 가독성
- 성능 최적화 가능성
- 보안 취약점
- 베스트 프랙티스 준수
{{#if includeRefactoring}}
- 리팩토링 제안
{{/if}}

{{#if specificConcerns}}
특별히 주의깊게 봐야 할 부분:
{{specificConcerns}}
{{/if}}`,
      variables: [
        {
          name: 'language',
          description: 'Programming language',
          type: 'select',
          required: true,
          options: [
            { label: 'JavaScript', value: 'javascript' },
            { label: 'TypeScript', value: 'typescript' },
            { label: 'Python', value: 'python' },
            { label: 'Java', value: 'java' },
            { label: 'C++', value: 'cpp' }
          ]
        },
        {
          name: 'code',
          description: 'Code to review',
          type: 'multiline',
          required: true
        },
        {
          name: 'includeRefactoring',
          description: 'Include refactoring suggestions',
          type: 'select',
          required: false,
          default: true,
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]
        },
        {
          name: 'specificConcerns',
          description: 'Specific areas of concern',
          type: 'multiline',
          required: false
        }
      ],
      language: 'ko',
      tags: ['development', 'code', 'review']
    },
    {
      id: 'explain-concept',
      name: 'Concept Explanation',
      description: 'Explain complex concepts in simple terms',
      category: 'Education',
      template: `{{concept}}에 대해 {{level}} 수준으로 설명해주세요.

{{#if includeExamples}}
실제 예시와 함께 설명해주세요.
{{/if}}

{{#if includeAnalogy}}
이해하기 쉬운 비유를 사용해서 설명해주세요.
{{/if}}

{{#if specificAspects}}
특히 다음 측면에 집중해서 설명해주세요:
{{specificAspects}}
{{/if}}`,
      variables: [
        {
          name: 'concept',
          description: 'Concept to explain',
          type: 'text',
          required: true
        },
        {
          name: 'level',
          description: 'Explanation level',
          type: 'select',
          required: true,
          default: '중급자',
          options: [
            { label: '초보자', value: '초보자' },
            { label: '중급자', value: '중급자' },
            { label: '전문가', value: '전문가' }
          ]
        },
        {
          name: 'includeExamples',
          description: 'Include examples',
          type: 'select',
          required: false,
          default: true,
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]
        },
        {
          name: 'includeAnalogy',
          description: 'Include analogies',
          type: 'select',
          required: false,
          default: false,
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]
        },
        {
          name: 'specificAspects',
          description: 'Specific aspects to focus on',
          type: 'multiline',
          required: false
        }
      ],
      language: 'ko',
      tags: ['education', 'explanation', 'learning']
    },
    {
      id: 'creative-writing',
      name: 'Creative Writing',
      description: 'Generate creative content with specific parameters',
      category: 'Creative',
      template: `{{type}}을(를) 작성해주세요.

주제: {{topic}}
장르: {{genre}}
분위기: {{mood}}
길이: {{length}}

{{#if characters}}
주요 인물:
{{characters}}
{{/if}}

{{#if setting}}
배경 설정:
{{setting}}
{{/if}}

{{#if style}}
문체: {{style}}
{{/if}}

{{#if additionalRequirements}}
추가 요구사항:
{{additionalRequirements}}
{{/if}}`,
      variables: [
        {
          name: 'type',
          description: 'Type of content',
          type: 'select',
          required: true,
          options: [
            { label: '단편소설', value: '단편소설' },
            { label: '시', value: '시' },
            { label: '에세이', value: '에세이' },
            { label: '대화', value: '대화' },
            { label: '시나리오', value: '시나리오' }
          ]
        },
        {
          name: 'topic',
          description: 'Topic or theme',
          type: 'text',
          required: true
        },
        {
          name: 'genre',
          description: 'Genre',
          type: 'select',
          required: false,
          options: [
            { label: '로맨스', value: '로맨스' },
            { label: '미스터리', value: '미스터리' },
            { label: 'SF', value: 'SF' },
            { label: '판타지', value: '판타지' },
            { label: '드라마', value: '드라마' },
            { label: '코미디', value: '코미디' }
          ]
        },
        {
          name: 'mood',
          description: 'Mood or tone',
          type: 'text',
          required: false
        },
        {
          name: 'length',
          description: 'Desired length',
          type: 'select',
          required: false,
          default: '중간',
          options: [
            { label: '짧게', value: '짧게' },
            { label: '중간', value: '중간' },
            { label: '길게', value: '길게' }
          ]
        },
        {
          name: 'characters',
          description: 'Main characters',
          type: 'multiline',
          required: false
        },
        {
          name: 'setting',
          description: 'Setting description',
          type: 'multiline',
          required: false
        },
        {
          name: 'style',
          description: 'Writing style',
          type: 'text',
          required: false
        },
        {
          name: 'additionalRequirements',
          description: 'Additional requirements',
          type: 'multiline',
          required: false
        }
      ],
      language: 'ko',
      tags: ['creative', 'writing', 'content']
    }
  ]

  async beforeSendMessage(content: string, context: any): Promise<string | null> {
    // Check if message starts with a template trigger
    const templateMatch = content.match(/^\/template\s+(\w+)(?:\s+(.+))?$/s)
    if (!templateMatch) return null

    const templateId = templateMatch[1]
    const params = templateMatch[2]

    const template = this.templates.find(t => t.id === templateId)
    if (!template) return null

    // Parse parameters (simple key=value format)
    const variables: Record<string, any> = {}
    if (params) {
      const pairs = params.split(/\s+(?=\w+=)/)
      for (const pair of pairs) {
        const [key, value] = pair.split('=', 2)
        if (key && value) {
          variables[key] = value.replace(/^["']|["']$/g, '') // Remove quotes
        }
      }
    }

    return this.renderTemplate(template, variables)
  }

  private renderTemplate(template: PromptTemplate, variables: Record<string, any>): string {
    let rendered = template.template

    // Simple template rendering (replace {{variable}} patterns)
    for (const variable of template.variables) {
      const value = variables[variable.name] ?? variable.default ?? ''
      const pattern = new RegExp(`{{${variable.name}}}`, 'g')
      rendered = rendered.replace(pattern, String(value))
    }

    // Handle conditional blocks {{#if variable}}...{{/if}}
    rendered = rendered.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, varName, content) => {
      const value = variables[varName]
      return value ? content : ''
    })

    return rendered
  }

  getTemplates(): PromptTemplate[] {
    return this.templates
  }

  getTemplatesByCategory(category: string): PromptTemplate[] {
    return this.templates.filter(t => t.category === category)
  }

  getTemplatesByTag(tag: string): PromptTemplate[] {
    return this.templates.filter(t => t.tags.includes(tag))
  }

  addCustomTemplate(template: PromptTemplate): void {
    this.templates.push(template)
    this.saveCustomTemplates()
  }

  removeCustomTemplate(templateId: string): void {
    this.templates = this.templates.filter(t => t.id !== templateId)
    this.saveCustomTemplates()
  }

  private saveCustomTemplates(): void {
    const customTemplates = this.templates.filter(t => !t.id.startsWith('builtin-'))
    localStorage.setItem('claude-wrapper-custom-templates', JSON.stringify(customTemplates))
  }

  private loadCustomTemplates(): void {
    try {
      const stored = localStorage.getItem('claude-wrapper-custom-templates')
      if (stored) {
        const customTemplates = JSON.parse(stored) as PromptTemplate[]
        this.templates.push(...customTemplates)
      }
    } catch (error) {
      console.error('Failed to load custom templates:', error)
    }
  }

  async onEnable(): Promise<void> {
    this.loadCustomTemplates()
  }
}