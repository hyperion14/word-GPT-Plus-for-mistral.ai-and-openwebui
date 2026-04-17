import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatGroq } from '@langchain/groq'
import { MemorySaver } from '@langchain/langgraph'
import { ChatOllama } from '@langchain/ollama'
import { AzureChatOpenAI, ChatOpenAI } from '@langchain/openai'
import { createAgent } from 'langchain'

import { MistralChat } from './mistralChat'
import {
  AgentOptions,
  AzureOptions,
  GeminiOptions,
  GroqOptions,
  MistralOptions,
  OllamaOptions,
  OpenAIOptions,
  OpenWebUIOptions,
  ProviderOptions,
} from './types'

const ModelCreators: Record<string, (opts: any) => BaseChatModel> = {
  official: (opts: OpenAIOptions) => {
    const modelName = opts.model || 'gpt-5'
    return new ChatOpenAI({
      modelName,
      configuration: {
        apiKey: opts.config.apiKey,
        baseURL: opts.config.baseURL || 'https://api.openai.com/v1',
      },
      temperature: opts.temperature ?? 0.7,
      maxTokens: opts.maxTokens ?? 800,
    })
  },

  ollama: (opts: OllamaOptions) => {
    return new ChatOllama({
      model: opts.ollamaModel,
      baseUrl: opts.ollamaEndpoint?.replace(/\/$/, '') || 'http://localhost:11434',
      temperature: opts.temperature,
    })
  },

  groq: (opts: GroqOptions) => {
    return new ChatGroq({
      model: opts.groqModel,
      apiKey: opts.groqAPIKey,
      temperature: opts.temperature ?? 0.5,
      maxTokens: opts.maxTokens ?? 1024,
    })
  },

  gemini: (opts: GeminiOptions) => {
    return new ChatGoogleGenerativeAI({
      model: opts.geminiModel ?? 'gemini-3-pro-preview',
      apiKey: opts.geminiAPIKey,
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 800,
    })
  },

  azure: (opts: AzureOptions) => {
    return new AzureChatOpenAI({
      model: opts.azureDeploymentName,
      temperature: opts.temperature ?? 0.7,
      maxTokens: opts.maxTokens ?? 800,
      azureOpenAIApiKey: opts.azureAPIKey,
      azureOpenAIEndpoint: opts.azureAPIEndpoint,
      azureOpenAIApiDeploymentName: opts.azureDeploymentName,
      azureOpenAIApiVersion: opts.azureAPIVersion ?? '2024-10-01',
    })
  },

  mistral: (opts: MistralOptions) => {
    // Use custom implementation to avoid CORS issues with OpenAI SDK headers
    return new MistralChat({
      apiKey: opts.mistralAPIKey,
      model: opts.mistralModel || 'mistral-large-latest',
      temperature: opts.temperature ?? 0.7,
      maxTokens: opts.maxTokens ?? 1024,
    })
  },

  openwebui: null, // Handled separately via direct fetch (OpenWebUI rejects ChatOpenAI's extra params)
}

const checkpointer = new MemorySaver()

async function executeChatFlow(model: BaseChatModel, options: ProviderOptions): Promise<void> {
  try {
    // Stream directly from model - avoids LangGraph agent overhead
    // and extra parameters that some providers (OpenWebUI) don't support
    const stream = await model.stream(options.messages, {
      signal: options.abortSignal,
    })

    let fullContent = ''
    for await (const chunk of stream) {
      if (options.abortSignal?.aborted) {
        break
      }

      const content = typeof chunk.content === 'string' ? chunk.content : ''
      fullContent += content
      options.onStream(fullContent)
    }
  } catch (error: any) {
    if (error.name === 'AbortError' || options.abortSignal?.aborted) {
      throw error
    }
    options.errorIssue.value = true
    console.error(error)
  } finally {
    options.loading.value = false
  }
}

async function executeAgentFlow(model: BaseChatModel, options: AgentOptions): Promise<void> {
  try {
    const agent = createAgent({
      model,
      tools: options.tools || [],
      checkpointer,
    })

    const stream = await agent.stream(
      {
        messages: options.messages,
      },
      {
        signal: options.abortSignal,
        configurable: { thread_id: options.threadId },
        streamMode: 'values',
      },
    )

    let fullContent = ''
    let stepCount = 0

    for await (const step of stream) {
      if (options.abortSignal?.aborted) {
        break
      }

      stepCount++

      const messages = step.messages || []
      const lastMessage = messages[messages.length - 1]

      if (!lastMessage) continue

      const msg = lastMessage as any

      // Handle AI messages with tool calls
      if (msg._getType?.() === 'ai' && msg.tool_calls?.length > 0) {
        for (const toolCall of msg.tool_calls) {
          if (options.onToolCall) {
            options.onToolCall(toolCall.name, toolCall.args)
          }
        }
      }

      // Handle tool result messages
      if (msg._getType?.() === 'tool') {
        const toolName = msg.name || 'unknown'
        const toolContent = String(msg.content || '')
        if (options.onToolResult) {
          options.onToolResult(toolName, toolContent)
        }
      }

      // Handle AI message content (the final response)
      if (msg._getType?.() === 'ai' && msg.content) {
        const content = typeof msg.content === 'string' ? msg.content : ''
        if (content && (!msg.tool_calls || msg.tool_calls.length === 0)) {
          fullContent = content
          options.onStream(fullContent)
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError' || options.abortSignal?.aborted) {
      throw error
    }
    options.errorIssue.value = true
    console.error('[Agent] Error:', error)
  } finally {
    options.loading.value = false
  }
}

async function executeOpenWebUIChatFlow(options: ProviderOptions): Promise<void> {
  const opts = options as unknown as OpenWebUIOptions
  const baseURL = opts.openwebuiBaseURL.replace(/\/$/, '')

  const messages = options.messages.map((msg) => {
    const type = (msg as any)._getType?.() || 'user'
    const role = type === 'human' ? 'user' : type === 'ai' ? 'assistant' : type === 'system' ? 'system' : 'user'
    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    return { role, content }
  })

  try {
    const response = await fetch(`${baseURL}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opts.openwebuiAPIKey}`,
      },
      body: JSON.stringify({
        model: opts.openwebuiModel || 'llama3.1:latest',
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 1024,
        stream: true,
      }),
      signal: options.abortSignal,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`${response.status}: ${errorBody}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let fullContent = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done || options.abortSignal?.aborted) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6))
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              options.onStream(fullContent)
            }
          } catch {
            // skip malformed SSE
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError' || options.abortSignal?.aborted) {
      throw error
    }
    options.errorIssue.value = true
    console.error(error)
  } finally {
    options.loading.value = false
  }
}

export async function getChatResponse(options: ProviderOptions) {
  // OpenWebUI: use direct fetch (ChatOpenAI sends params that cause 422)
  if (options.provider === 'openwebui') {
    return executeOpenWebUIChatFlow(options)
  }

  const creator = ModelCreators[options.provider]
  if (!creator) {
    throw new Error(`Unsupported provider: ${options.provider}`)
  }
  const model = creator(options)
  return executeChatFlow(model, options)
}

export async function getAgentResponse(options: AgentOptions) {
  const creator = ModelCreators[options.provider]
  if (!creator) {
    throw new Error(`Unsupported provider: ${options.provider}`)
  }
  const model = creator(options)
  return executeAgentFlow(model, options)
}
