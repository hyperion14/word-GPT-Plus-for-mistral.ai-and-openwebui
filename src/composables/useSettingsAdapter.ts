/**
 * Settings Adapter - Bridges new settings system to old UI format
 * This provides a flat interface for the UI while using the new nested settings underneath
 */

import { computed, Ref } from 'vue'

import { Settings } from '@/settings/schema'
import { SettingsStorage } from '@/settings/storage'
import { useSettings } from '@/settings/useSettings'

export interface FlatSettings {
  // General
  localLanguage: string
  replyLanguage: string
  api: string
  systemPrompt: string
  userPrompt: string

  // OpenAI
  officialAPIKey: string
  officialBasePath: string
  officialModelSelect: string
  officialTemperature: number
  officialMaxTokens: number

  // Azure
  azureAPIKey: string
  azureAPIEndpoint: string
  azureAPIVersion: string
  azureDeploymentName: string
  azureTemperature: number
  azureMaxTokens: number

  // Gemini
  geminiAPIKey: string
  geminiModelSelect: string
  geminiTemperature: number
  geminiMaxTokens: number

  // Ollama
  ollamaEndpoint: string
  ollamaModelSelect: string
  ollamaTemperature: number
  ollamaMaxTokens: number

  // Groq
  groqAPIKey: string
  groqModelSelect: string
  groqTemperature: number
  groqMaxTokens: number

  // Mistral
  mistralAPIKey: string
  mistralBaseURL: string
  mistralModelSelect: string
  mistralTemperature: number
  mistralMaxTokens: number

  // Open WebUI
  openwebuiURL: string // User-friendly OpenWebUI URL
  openwebuiPluginURL: string // Plugin URL
  openwebuiInstance: string
  openwebuiBaseURL: string // Auto-computed base URL
  openwebuiAPIKey: string // Actually JWT token
  openwebuiModelSelect: string
  openwebuiTemperature: number
  openwebuiMaxTokens: number
}

/**
 * Provides a flat settings interface compatible with old UI
 * while using the new nested settings system underneath
 */
export function useSettingsAdapter(): Ref<FlatSettings> {
  const settings = useSettings()

  return computed({
    get(): FlatSettings {
      return {
        // General
        localLanguage: settings.value.localLanguage,
        replyLanguage: settings.value.replyLanguage,
        api: settings.value.provider,
        systemPrompt: settings.value.systemPrompt,
        userPrompt: settings.value.userPrompt,

        // OpenAI
        officialAPIKey: settings.value.openai.apiKey,
        officialBasePath: settings.value.openai.baseURL,
        officialModelSelect: settings.value.openai.model,
        officialTemperature: settings.value.openai.temperature,
        officialMaxTokens: settings.value.openai.maxTokens,

        // Azure
        azureAPIKey: settings.value.azure.apiKey,
        azureAPIEndpoint: settings.value.azure.endpoint,
        azureAPIVersion: settings.value.azure.apiVersion,
        azureDeploymentName: settings.value.azure.deploymentName,
        azureTemperature: settings.value.azure.temperature,
        azureMaxTokens: settings.value.azure.maxTokens,

        // Gemini
        geminiAPIKey: settings.value.gemini.apiKey,
        geminiModelSelect: settings.value.gemini.model,
        geminiTemperature: settings.value.gemini.temperature,
        geminiMaxTokens: settings.value.gemini.maxTokens,

        // Ollama
        ollamaEndpoint: settings.value.ollama.endpoint,
        ollamaModelSelect: settings.value.ollama.model,
        ollamaTemperature: settings.value.ollama.temperature,
        ollamaMaxTokens: settings.value.ollama.maxTokens,

        // Groq
        groqAPIKey: settings.value.groq.apiKey,
        groqModelSelect: settings.value.groq.model,
        groqTemperature: settings.value.groq.temperature,
        groqMaxTokens: settings.value.groq.maxTokens,

        // Mistral
        mistralAPIKey: settings.value.mistral.apiKey,
        mistralBaseURL: settings.value.mistral.baseURL,
        mistralModelSelect: settings.value.mistral.model,
        mistralTemperature: settings.value.mistral.temperature,
        mistralMaxTokens: settings.value.mistral.maxTokens,

        // Open WebUI - using jwtToken
        openwebuiURL: settings.value.openwebui.openwebuiURL,
        openwebuiPluginURL: settings.value.openwebui.pluginURL,
        openwebuiInstance: settings.value.openwebui.instance,
        openwebuiBaseURL: settings.value.openwebui.baseURL,
        openwebuiAPIKey: settings.value.openwebui.jwtToken, // Note: UI calls it APIKey but it's JWT
        openwebuiModelSelect: settings.value.openwebui.model,
        openwebuiTemperature: settings.value.openwebui.temperature,
        openwebuiMaxTokens: settings.value.openwebui.maxTokens,
      }
    },
    set(flatSettings: FlatSettings) {
      // Update nested settings from flat structure
      settings.value = {
        ...settings.value,
        localLanguage: flatSettings.localLanguage as 'en' | 'zh-cn',
        replyLanguage: flatSettings.replyLanguage as 'en' | 'zh-cn' | 'auto',
        provider: flatSettings.api as Settings['provider'],
        systemPrompt: flatSettings.systemPrompt,
        userPrompt: flatSettings.userPrompt,

        openai: {
          ...settings.value.openai,
          apiKey: flatSettings.officialAPIKey,
          baseURL: flatSettings.officialBasePath,
          model: flatSettings.officialModelSelect,
          temperature: flatSettings.officialTemperature,
          maxTokens: flatSettings.officialMaxTokens,
        },

        azure: {
          ...settings.value.azure,
          apiKey: flatSettings.azureAPIKey,
          endpoint: flatSettings.azureAPIEndpoint,
          apiVersion: flatSettings.azureAPIVersion,
          deploymentName: flatSettings.azureDeploymentName,
          temperature: flatSettings.azureTemperature,
          maxTokens: flatSettings.azureMaxTokens,
        },

        gemini: {
          ...settings.value.gemini,
          apiKey: flatSettings.geminiAPIKey,
          model: flatSettings.geminiModelSelect,
          temperature: flatSettings.geminiTemperature,
          maxTokens: flatSettings.geminiMaxTokens,
        },

        ollama: {
          ...settings.value.ollama,
          endpoint: flatSettings.ollamaEndpoint,
          model: flatSettings.ollamaModelSelect,
          temperature: flatSettings.ollamaTemperature,
          maxTokens: flatSettings.ollamaMaxTokens,
        },

        groq: {
          ...settings.value.groq,
          apiKey: flatSettings.groqAPIKey,
          model: flatSettings.groqModelSelect,
          temperature: flatSettings.groqTemperature,
          maxTokens: flatSettings.groqMaxTokens,
        },

        mistral: {
          ...settings.value.mistral,
          apiKey: flatSettings.mistralAPIKey,
          baseURL: flatSettings.mistralBaseURL,
          model: flatSettings.mistralModelSelect,
          temperature: flatSettings.mistralTemperature,
          maxTokens: flatSettings.mistralMaxTokens,
        },

        openwebui: {
          ...settings.value.openwebui,
          openwebuiURL: flatSettings.openwebuiURL,
          pluginURL: flatSettings.openwebuiPluginURL,
          instance: flatSettings.openwebuiInstance as 'jachat' | 'bhk' | 'jachat-external' | 'custom',
          baseURL: flatSettings.openwebuiBaseURL,
          jwtToken: flatSettings.openwebuiAPIKey,
          model: flatSettings.openwebuiModelSelect,
          temperature: flatSettings.openwebuiTemperature,
          maxTokens: flatSettings.openwebuiMaxTokens,
        },
      }

      // CRITICAL FIX: Explicitly save settings after update
      // The deep watch in useSettings.ts may not trigger when the entire object is replaced
      // This ensures settings are ALWAYS persisted when changed through the UI
      console.log('💾 [SettingsAdapter] About to save settings. Provider:', settings.value.provider)
      console.log('💾 [SettingsAdapter] Full settings object:', JSON.stringify(settings.value, null, 2))
      SettingsStorage.save(settings.value)
      console.log('💾 [SettingsAdapter] Save call completed')
    },
  })
}
