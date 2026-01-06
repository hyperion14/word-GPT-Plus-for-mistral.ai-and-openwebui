import { z } from 'zod'

// Define all settings in one place
export const SettingsSchema = z.object({
  // UI Settings
  localLanguage: z.enum(['en', 'zh-cn']).default('en'),
  replyLanguage: z.enum(['en', 'zh-cn', 'auto']).default('auto'),

  // Provider Settings
  provider: z.enum(['official', 'ollama', 'groq', 'gemini', 'azure', 'mistral', 'openwebui']),

  // Prompt Settings
  systemPrompt: z.string().default(''),
  userPrompt: z.string().default(''),

  // OpenAI Settings
  openai: z.object({
    apiKey: z.string(),
    baseURL: z.string().default('https://api.openai.com/v1'),
    model: z.string().default('gpt-4'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(800),
  }),

  // Azure OpenAI Settings
  azure: z.object({
    apiKey: z.string().default(''),
    endpoint: z.string().default(''),
    deploymentName: z.string().default(''),
    apiVersion: z.string().default('2024-10-01'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(800),
  }),

  // Google Gemini Settings
  gemini: z.object({
    apiKey: z.string().default(''),
    model: z.string().default('gemini-3-pro-preview'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(800),
  }),

  // Groq Settings
  groq: z.object({
    apiKey: z.string().default(''),
    model: z.string().default('llama-3.3-70b-versatile'),
    temperature: z.number().min(0).max(2).default(0.5),
    maxTokens: z.number().min(1).max(32000).default(1024),
  }),

  // Mistral AI Settings
  mistral: z.object({
    apiKey: z.string().default(''),
    baseURL: z.string().default('https://api.mistral.ai/v1'),
    model: z.string().default('mistral-large-latest'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(1024),
  }),

  // Ollama Settings
  ollama: z.object({
    endpoint: z.string().default('http://localhost:11434'),
    model: z.string().default('qwen3:latest'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(800),
  }),

  // OpenWebUI Settings
  openwebui: z.object({
    jwtToken: z.string().default(''),
    baseURL: z.string().default('http://localhost:3100/openwebui-api'),
    model: z.string().default(''),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(1024),
    // RAG/Knowledge Base settings
    knowledgeBase: z.object({
      enabled: z.boolean().default(false),
      selectedCollections: z.array(z.string()).default([]),
      searchType: z.enum(['similarity', 'mmr', 'similarity_score_threshold']).default('similarity'),
      topK: z.number().min(1).max(20).default(5),
    }),
  }),

  // Tool Settings
  tools: z.object({
    wordTools: z.array(z.string()).default([]),
    generalTools: z.array(z.string()).default([]),
  }),
})

export type Settings = z.infer<typeof SettingsSchema>

export const defaultSettings: Settings = {
  localLanguage: 'en',
  replyLanguage: 'auto',
  provider: 'official',
  systemPrompt: '',
  userPrompt: '',
  openai: {
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 800,
  },
  azure: {
    apiKey: '',
    endpoint: '',
    deploymentName: '',
    apiVersion: '2024-10-01',
    temperature: 0.7,
    maxTokens: 800,
  },
  gemini: {
    apiKey: '',
    model: 'gemini-3-pro-preview',
    temperature: 0.7,
    maxTokens: 800,
  },
  groq: {
    apiKey: '',
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    maxTokens: 1024,
  },
  mistral: {
    apiKey: '',
    baseURL: 'https://api.mistral.ai/v1',
    model: 'mistral-large-latest',
    temperature: 0.7,
    maxTokens: 1024,
  },
  ollama: {
    endpoint: 'http://localhost:11434',
    model: 'qwen3:latest',
    temperature: 0.7,
    maxTokens: 800,
  },
  openwebui: {
    jwtToken: '',
    baseURL: '',
    model: '',
    temperature: 0.7,
    maxTokens: 1024,
    knowledgeBase: {
      enabled: false,
      selectedCollections: [],
      searchType: 'similarity',
      topK: 5,
    },
  },
  tools: {
    wordTools: [],
    generalTools: [],
  },
}
