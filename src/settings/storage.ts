import { defaultSettings, Settings, SettingsSchema } from './schema'
import { getPluginURL, resolveBaseURL } from '@/composables/useOpenWebUIInstance'

const STORAGE_KEY = 'oi-mistral-settings-v2'
const LEGACY_STORAGE_KEY = 'word-gpt-plus-settings-v2'

export class SettingsStorage {
  static load(): Settings {
    try {
      let stored = localStorage.getItem(STORAGE_KEY)

      // Migrate from old storage key if new key doesn't exist
      if (!stored) {
        const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY)
        if (legacyStored) {
          localStorage.setItem(STORAGE_KEY, legacyStored)
          localStorage.removeItem(LEGACY_STORAGE_KEY)
          stored = legacyStored
        }
      }

      if (!stored) {
        return this.applyPluginURLDefaults(defaultSettings)
      }

      const parsed = JSON.parse(stored)
      const corrected = this.autoCorrectSettings(parsed)
      const validated = SettingsSchema.parse(corrected)
      return validated
    } catch {
      const recovered = this.attemptPartialRecovery()
      if (recovered) return recovered
      return defaultSettings
    }
  }

  static save(settings: Settings): void {
    try {
      const validated = SettingsSchema.parse(settings)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated))
    } catch {
      // validation failed
    }
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Apply correct pluginURL and baseURL based on current browser location
   */
  private static applyPluginURLDefaults(settings: Settings): Settings {
    const pluginURL = getPluginURL()
    const openwebuiURL = settings.openwebui.openwebuiURL
    const baseURL = resolveBaseURL(openwebuiURL, pluginURL)
    return {
      ...settings,
      openwebui: {
        ...settings.openwebui,
        pluginURL: pluginURL,
        baseURL: baseURL || settings.openwebui.baseURL,
      },
    }
  }

  /**
   * Automatically correct common settings issues
   */
  private static autoCorrectSettings(raw: any): any {
    const corrected = { ...raw }

    // Fix pluginURL and recompute baseURL
    if (corrected.openwebui) {
      const pluginURL = getPluginURL()
      const currentPluginURL = corrected.openwebui.pluginURL || ''

      if (
        (!currentPluginURL || currentPluginURL === 'http://localhost:3100') &&
        pluginURL !== 'http://localhost:3100'
      ) {
        corrected.openwebui.pluginURL = pluginURL
      }

      // Always recompute baseURL
      const effectivePluginURL = corrected.openwebui.pluginURL || pluginURL
      const openwebuiURL = corrected.openwebui.openwebuiURL || ''
      if (effectivePluginURL && openwebuiURL) {
        corrected.openwebui.baseURL = resolveBaseURL(openwebuiURL, effectivePluginURL)
      }
    }

    // Fix missing provider structure
    const providerMap: Record<string, keyof Settings> = {
      official: 'openai',
      azure: 'azure',
      gemini: 'gemini',
      groq: 'groq',
      mistral: 'mistral',
      ollama: 'ollama',
      openwebui: 'openwebui',
    }

    const providerKey = providerMap[corrected.provider]
    if (providerKey && providerKey in defaultSettings && !corrected[providerKey]) {
      const defaultProviderSettings = defaultSettings[providerKey]
      if (defaultProviderSettings && typeof defaultProviderSettings === 'object') {
        corrected[providerKey] = { ...defaultProviderSettings }
      }
    }

    // Fix corrupted knowledge base settings
    if (corrected.openwebui?.knowledgeBase?.enabled) {
      if (!Array.isArray(corrected.openwebui.knowledgeBase.selectedCollections)) {
        corrected.openwebui.knowledgeBase.selectedCollections = []
      }
    }

    // Fix missing temperature/maxTokens for all providers
    const providersWithSettings = ['openai', 'azure', 'gemini', 'groq', 'mistral', 'ollama', 'openwebui'] as const
    for (const provider of providersWithSettings) {
      if (corrected[provider]) {
        if (!corrected[provider].temperature || typeof corrected[provider].temperature !== 'number') {
          corrected[provider].temperature = defaultSettings[provider].temperature
        }
        if (!corrected[provider].maxTokens || typeof corrected[provider].maxTokens !== 'number') {
          corrected[provider].maxTokens = defaultSettings[provider].maxTokens
        }
      }
    }

    if (!corrected.localLanguage) corrected.localLanguage = defaultSettings.localLanguage
    if (corrected.localLanguage === 'zh-CN') corrected.localLanguage = 'zh-cn'
    if (!corrected.replyLanguage) corrected.replyLanguage = defaultSettings.replyLanguage
    if (corrected.replyLanguage === 'zh-CN') corrected.replyLanguage = 'zh-cn'
    if (!corrected.provider) corrected.provider = defaultSettings.provider
    if (typeof corrected.systemPrompt !== 'string') corrected.systemPrompt = defaultSettings.systemPrompt
    if (typeof corrected.userPrompt !== 'string') corrected.userPrompt = defaultSettings.userPrompt

    // Fix tools array
    if (!Array.isArray(corrected.tools?.wordTools)) {
      if (!corrected.tools) corrected.tools = {}
      corrected.tools.wordTools = []
    }
    if (!Array.isArray(corrected.tools?.generalTools)) {
      if (!corrected.tools) corrected.tools = {}
      corrected.tools.generalTools = []
    }

    return corrected
  }

  /**
   * Attempt to recover settings piece by piece if main recovery fails
   */
  private static attemptPartialRecovery(): Settings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      const recovered: Partial<Settings> = {}

      if (parsed.localLanguage && ['en', 'zh-cn'].includes(parsed.localLanguage)) {
        recovered.localLanguage = parsed.localLanguage
      }
      if (parsed.replyLanguage && ['en', 'zh-cn', 'auto'].includes(parsed.replyLanguage)) {
        recovered.replyLanguage = parsed.replyLanguage
      }
      if (parsed.provider) recovered.provider = parsed.provider
      if (parsed.openai && typeof parsed.openai === 'object') recovered.openai = parsed.openai
      if (parsed.openwebui && typeof parsed.openwebui === 'object') recovered.openwebui = parsed.openwebui

      if (!recovered.tools) recovered.tools = { wordTools: [], generalTools: [] }
      if (Array.isArray(parsed.tools?.wordTools)) recovered.tools.wordTools = parsed.tools.wordTools
      if (Array.isArray(parsed.tools?.generalTools)) recovered.tools.generalTools = parsed.tools.generalTools

      const result = { ...defaultSettings, ...recovered }
      return result
    } catch {
      return null
    }
  }

  static migrateFromLegacy(): Settings {
    try {
      let localLang = localStorage.getItem('localLanguage') || 'en'
      if (localLang === 'zh-CN') localLang = 'zh-cn'

      let replyLang = localStorage.getItem('replyLanguage') || 'auto'
      if (replyLang === 'zh-CN') replyLang = 'zh-cn'

      const pluginURL = getPluginURL()
      const openwebuiURL = localStorage.getItem('openwebuiURL') || 'http://localhost:3010'

      const newSettings: Settings = {
        ...defaultSettings,
        localLanguage: localLang as 'en' | 'zh-cn',
        replyLanguage: replyLang as 'en' | 'zh-cn' | 'auto',
        provider: (localStorage.getItem('api') || localStorage.getItem('provider') || 'official') as Settings['provider'],
        systemPrompt: localStorage.getItem('defaultSystemPrompt') || '',
        userPrompt: localStorage.getItem('defaultPrompt') || '',
        openai: {
          apiKey: localStorage.getItem('openaiAPIKey') || '',
          baseURL: localStorage.getItem('openaiBaseURL') || 'https://api.openai.com/v1',
          model: localStorage.getItem('openaiModel') || 'gpt-4',
          temperature: parseFloat(localStorage.getItem('openaiTemperature') || '0.7'),
          maxTokens: parseInt(localStorage.getItem('openaiMaxTokens') || '800'),
        },
        azure: {
          apiKey: localStorage.getItem('azureAPIKey') || '',
          endpoint: localStorage.getItem('azureAPIEndpoint') || '',
          deploymentName: localStorage.getItem('azureDeploymentName') || '',
          apiVersion: localStorage.getItem('azureAPIVersion') || '2024-10-01',
          temperature: parseFloat(localStorage.getItem('azureTemperature') || '0.7'),
          maxTokens: parseInt(localStorage.getItem('azureMaxTokens') || '800'),
        },
        gemini: {
          apiKey: localStorage.getItem('geminiAPIKey') || '',
          model: localStorage.getItem('geminiModel') || 'gemini-3-pro-preview',
          temperature: parseFloat(localStorage.getItem('geminiTemperature') || '0.7'),
          maxTokens: parseInt(localStorage.getItem('geminiMaxTokens') || '800'),
        },
        groq: {
          apiKey: localStorage.getItem('groqAPIKey') || '',
          model: localStorage.getItem('groqModel') || 'llama-3.3-70b-versatile',
          temperature: parseFloat(localStorage.getItem('groqTemperature') || '0.5'),
          maxTokens: parseInt(localStorage.getItem('groqMaxTokens') || '1024'),
        },
        mistral: {
          apiKey: localStorage.getItem('mistralAPIKey') || '',
          baseURL: localStorage.getItem('mistralBaseURL') || 'https://api.mistral.ai/v1',
          model: localStorage.getItem('mistralModel') || 'mistral-large-latest',
          temperature: parseFloat(localStorage.getItem('mistralTemperature') || '0.7'),
          maxTokens: parseInt(localStorage.getItem('mistralMaxTokens') || '1024'),
        },
        ollama: {
          endpoint: localStorage.getItem('ollamaEndpoint') || 'http://localhost:11434',
          model: localStorage.getItem('ollamaModel') || 'qwen3:latest',
          temperature: parseFloat(localStorage.getItem('ollamaTemperature') || '0.7'),
          maxTokens: parseInt(localStorage.getItem('ollamaMaxTokens') || '800'),
        },
        openwebui: {
          openwebuiURL: openwebuiURL,
          pluginURL: pluginURL,
          jwtToken: localStorage.getItem('openwebuiAPIKey') || localStorage.getItem('openwebuiJWTToken') || '',
          baseURL: resolveBaseURL(openwebuiURL, pluginURL),
          model: localStorage.getItem('openwebuiModel') || '',
          temperature: parseFloat(localStorage.getItem('openwebuiTemperature') || '0.7'),
          maxTokens: parseInt(localStorage.getItem('openwebuiMaxTokens') || '1024'),
          knowledgeBase: {
            enabled: false,
            selectedCollections: [],
            searchType: 'similarity',
            topK: 5,
          },
        },
      }

      return newSettings
    } catch {
      return defaultSettings
    }
  }
}
