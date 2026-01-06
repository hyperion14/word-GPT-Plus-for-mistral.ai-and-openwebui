# ARCHITECTURE DOCUMENTATION
**Word GPT Plus - Mistral & OpenWebUI Fork**
**Version:** 2.0.1
**Last Updated:** January 4, 2026

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture Evolution](#architecture-evolution)
3. [Settings Architecture](#settings-architecture)
4. [Provider System](#provider-system)
5. [Directory Structure](#directory-structure)
6. [Data Flow](#data-flow)
7. [Migration Guide](#migration-guide)
8. [Development Guidelines](#development-guidelines)
9. [FAQ](#faq)

---

## OVERVIEW

This fork extends the original Word GPT Plus with two additional LLM providers:
- **Mistral AI** - Direct integration with Mistral's API
- **OpenWebUI** - Integration with Open WebUI's gateway (supports Ollama, OpenAI, Mistral, Gemini)

### Key Features Added

| Feature | Description | Status |
|---------|-------------|--------|
| Mistral Provider | Native Mistral AI integration with CORS-safe implementation | ✅ Stable |
| OpenWebUI Provider | OpenWebUI gateway with JWT authentication | ✅ Stable |
| RAG/Knowledge Base | Query OpenWebUI knowledge bases for context-aware responses | ✅ New in 2.0.0 |
| Zod Schema Validation | Type-safe settings with runtime validation | ✅ Complete in 2.0.1 |
| Error Recovery | Automatic recovery from corrupted settings | ✅ New in 2.0.0 |
| Tool Safety | Validation for Word document operations | ✅ New in 2.0.0 |
| Activity Logging | Track agent tool calls and results | ✅ New in 2.0.0 |

---

## ARCHITECTURE EVOLUTION

### Phase 1: Original Architecture (Pre-Fork)
```
Settings: localStorage (individual keys) → No validation
Providers: 5 (OpenAI, Azure, Gemini, Groq, Ollama)
Configuration: settingForm.ts + settingPreset.ts
```

### Phase 2: Provider Addition (v2.0.0)
```
Settings: Still localStorage (individual keys)
Providers: 7 (Added Mistral, OpenWebUI)
Configuration: Extended settingForm + settingPreset
```

### Phase 3: Schema Migration (v2.0.1) - **CURRENT**
```
Settings: Zod-validated schema → localStorage (single object)
Providers: 7 (All providers migrated to schema)
Configuration: schema.ts + storage.ts + useSettings.ts
Migration: Automatic from legacy localStorage keys
```

---

## SETTINGS ARCHITECTURE

### Overview

Version 2.0.1 introduces a **unified settings architecture** with:
- ✅ Type-safe Zod schema
- ✅ Automatic validation and error correction
- ✅ Seamless migration from legacy system
- ✅ All 7 providers supported

### Settings Schema Structure

File: [src/settings/schema.ts](src/settings/schema.ts)

```typescript
export const SettingsSchema = z.object({
  // UI Settings
  localLanguage: z.enum(['en', 'zh-CN']).default('zh-CN'),
  replyLanguage: z.enum(['en', 'zh-CN', 'auto']).default('auto'),
  provider: z.enum(['official', 'ollama', 'groq', 'gemini', 'azure', 'mistral', 'openwebui']),

  // Provider-specific settings (7 providers)
  openai: z.object({ ... }),
  azure: z.object({ ... }),
  gemini: z.object({ ... }),
  groq: z.object({ ... }),
  mistral: z.object({ ... }),
  ollama: z.object({ ... }),
  openwebui: z.object({
    ...
    knowledgeBase: z.object({ ... })  // RAG settings
  }),

  // Tool settings
  tools: z.object({
    wordTools: z.array(z.string()),
    generalTools: z.array(z.string()),
  }),
})
```

### Storage Strategy

**Storage Key:** `word-gpt-plus-settings-v2`
**Format:** Single JSON object containing all settings
**Validation:** Zod schema on load/save

#### Legacy Migration

The system automatically migrates from legacy localStorage keys:

```typescript
// Old system (v2.0.0 and earlier)
localStorage.getItem('mistralAPIKey')
localStorage.getItem('openwebuiBaseURL')
// ... 50+ individual keys

// New system (v2.0.1+)
localStorage.getItem('word-gpt-plus-settings-v2')
// Single object with all settings
```

**Migration happens automatically on first load** via [SettingsStorage.migrateFromLegacy()](src/settings/storage.ts#L170).

### Auto-Correction

The storage system includes intelligent auto-correction for common issues:

```typescript
// Missing provider structure
if (provider === 'mistral' && !settings.mistral) {
  settings.mistral = { ...defaultSettings.mistral }
}

// Invalid temperature
if (typeof settings.mistral.temperature !== 'number') {
  settings.mistral.temperature = 0.7
}

// Corrupted arrays
if (!Array.isArray(settings.tools.wordTools)) {
  settings.tools.wordTools = []
}
```

See [storage.ts:autoCorrectSettings()](src/settings/storage.ts#L52) for full implementation.

### Using Settings in Code

#### New Way (Recommended - v2.0.1+)

```typescript
import { useSettings } from '@/settings/useSettings'

const settings = useSettings()

// Reactive access
const apiKey = settings.value.mistral.apiKey
const temperature = settings.value.openwebui.temperature

// Auto-saves on change (debounced 500ms)
settings.value.mistral.model = 'mistral-small-latest'
```

#### Old Way (Legacy - Still Works)

```typescript
import { useSettingForm } from '@/utils/settingForm'

const settingForm = useSettingForm()

// Manual localStorage access
const apiKey = settingForm.value.mistralAPIKey
localStorage.setItem('mistralAPIKey', apiKey)
```

**Note:** Both systems work in v2.0.1. The new system is recommended for new code.

---

## PROVIDER SYSTEM

### Supported Providers

| Provider | Type | Authentication | Status |
|----------|------|----------------|--------|
| official (OpenAI) | Direct API | API Key | ✅ Stable |
| azure | Azure OpenAI | API Key + Endpoint | ✅ Stable |
| gemini | Google AI | API Key | ✅ Stable |
| groq | Groq | API Key | ✅ Stable |
| mistral | Mistral AI | API Key | ✅ Stable |
| ollama | Local/Self-hosted | None | ✅ Stable |
| openwebui | OpenWebUI Gateway | JWT Token | ✅ Stable |

### Provider Architecture

File: [src/api/union.ts](src/api/union.ts)

```typescript
const ModelCreators: Record<string, (opts: any) => BaseChatModel> = {
  official: (opts) => new ChatOpenAI({ ... }),
  azure: (opts) => new AzureChatOpenAI({ ... }),
  gemini: (opts) => new ChatGoogleGenerativeAI({ ... }),
  groq: (opts) => new ChatGroq({ ... }),
  mistral: (opts) => new MistralChat({ ... }),     // Custom implementation
  ollama: (opts) => new ChatOllama({ ... }),
  openwebui: (opts) => new ChatOpenAI({ ... }),   // Uses OpenAI SDK
}
```

### Provider-Specific Implementations

#### Mistral AI

**Custom Implementation:** [src/api/mistralChat.ts](src/api/mistralChat.ts)

**Why Custom?**
- Avoids CORS issues with OpenAI SDK's custom headers
- Direct `fetch()` calls with minimal headers
- Full streaming support with Server-Sent Events

**Key Features:**
```typescript
class MistralChat extends BaseChatModel {
  _llmType() { return 'mistral' }

  async _generate(messages, options, _runManager) {
    // Direct fetch to https://api.mistral.ai/v1/chat/completions
    // No custom headers → No CORS preflight
  }

  async *_streamResponseChunks(messages, options, _runManager) {
    // SSE streaming
    // Yields ChatGenerationChunk for each token
  }
}
```

#### OpenWebUI

**OpenAI SDK Wrapper:** Uses `ChatOpenAI` with custom baseURL

**Authentication:** JWT tokens (not API keys)

**Key Features:**
```typescript
openwebui: (opts) => {
  let baseURL = opts.openwebuiBaseURL
  if (!baseURL.includes('/api/v1')) {
    baseURL = `${baseURL}/api/v1`  // Auto-add OpenAI-compatible endpoint
  }

  return new ChatOpenAI({
    modelName: opts.openwebuiModel,
    configuration: {
      apiKey: opts.openwebuiAPIKey,  // Actually a JWT token
      baseURL,
    }
  })
}
```

**RAG Integration:** [src/api/openwebui-rag.ts](src/api/openwebui-rag.ts)

```typescript
// Fetch knowledge bases
async function fetchKnowledgeBases(baseURL, jwtToken): Promise<KnowledgeBase[]>

// Query knowledge
async function queryKnowledge(baseURL, jwtToken, query, options): Promise<any>
```

### Provider Configuration

Each provider has specific configuration requirements:

#### OpenAI (Official)
```typescript
{
  apiKey: string,        // Required
  baseURL: string,       // Optional (default: https://api.openai.com/v1)
  model: string,         // Required
  temperature: number,   // 0-2
  maxTokens: number,     // 1-32000
}
```

#### Mistral
```typescript
{
  apiKey: string,        // Required (from platform.mistral.ai)
  model: string,         // Required (mistral-large-latest, mistral-small-latest, etc.)
  temperature: number,   // 0-2
  maxTokens: number,     // 1-32000
}
```

#### OpenWebUI
```typescript
{
  jwtToken: string,      // Required (from Open WebUI Settings > Account > API Keys)
  baseURL: string,       // Required (e.g., https://wordai.hekanet.de/api)
  model: string,         // Required (any model supported by your OpenWebUI instance)
  temperature: number,   // 0-2
  maxTokens: number,     // 1-32000
  knowledgeBase: {
    enabled: boolean,
    selectedCollections: string[],
    searchType: 'similarity' | 'mmr' | 'similarity_score_threshold',
    topK: number,        // 1-20
  }
}
```

---

## DIRECTORY STRUCTURE

```
word-GPT-Plus-for-mistral-and-openwebui/
├── src/
│   ├── api/                    # Provider implementations
│   │   ├── types.ts            # TypeScript interfaces for all providers
│   │   ├── union.ts            # Provider factory (ModelCreators)
│   │   ├── mistralChat.ts      # Custom Mistral client
│   │   ├── openwebui.ts        # OpenWebUI utilities (model fetching)
│   │   └── openwebui-rag.ts    # RAG/Knowledge Base API
│   │
│   ├── settings/               # NEW: Unified settings system (v2.0.1)
│   │   ├── schema.ts           # Zod schema for all settings
│   │   ├── storage.ts          # Validated storage + migration logic
│   │   └── useSettings.ts      # Vue composable for reactive settings
│   │
│   ├── components/             # Vue components
│   │   ├── AgentActivityPanel.vue      # NEW: Agent activity log UI
│   │   └── OpenWebUIRagSettings.vue    # NEW: RAG configuration UI
│   │
│   ├── pages/
│   │   ├── HomePage.vue        # Main chat interface
│   │   └── SettingsPage.vue    # Settings configuration
│   │
│   ├── utils/                  # Utilities (legacy + new)
│   │   ├── settingForm.ts      # LEGACY: Old settings system
│   │   ├── settingPreset.ts    # LEGACY: Old settings definitions
│   │   ├── constant.ts         # Constants (model lists, API names)
│   │   ├── common.ts           # Utility functions (checkAuth, etc.)
│   │   ├── errorHandler.ts     # NEW: Structured error handling
│   │   ├── errorRecovery.ts    # NEW: Automatic error recovery
│   │   ├── toolSafety.ts       # NEW: Word document safety checks
│   │   ├── activityLog.ts      # NEW: Activity logging system
│   │   └── wordTools/          # NEW: Modularized Word tools
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── text-tools.ts
│   │       ├── document-tools.ts
│   │       ├── formatting-tools.ts
│   │       ├── structure-tools.ts
│   │       ├── navigation-tools.ts
│   │       └── content-control-tools.ts
│   │
│   ├── types/                  # NEW: Centralized type definitions
│   │   ├── common.ts           # Common types
│   │   ├── errors.ts           # Error types
│   │   ├── providers.ts        # Provider types
│   │   ├── settings.ts         # Settings types
│   │   └── tools.ts            # Tool types
│   │
│   └── i18n/
│       └── locales/
│           ├── en.json         # English translations
│           └── zh-cn.json      # Chinese translations
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # THIS FILE
│   ├── CRITICAL_REVIEW_2026-01-04.md  # Code review
│   ├── PLUGIN_PROVIDERS.md     # Provider documentation
│   └── TIER_1_*.md             # Deployment docs
│
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── README.md                   # Main readme
```

### Key File Relationships

```
Settings Flow:
  schema.ts → storage.ts → useSettings.ts → Components

Provider Flow:
  types.ts → union.ts → HomePage.vue (chat execution)
                      → SettingsPage.vue (configuration)

Legacy Flow (Still Active):
  settingPreset.ts → settingForm.ts → HomePage.vue
                                    → SettingsPage.vue
```

---

## DATA FLOW

### 1. Settings Initialization

```
App Start
  ↓
useSettings() called
  ↓
SettingsStorage.load()
  ↓
Try to load 'word-gpt-plus-settings-v2'
  ↓
  ├─ Found: Validate with Zod schema
  │   ↓
  │   ├─ Valid: Return settings
  │   └─ Invalid: Auto-correct → Validate again
  │
  └─ Not Found: migrateFromLegacy()
      ↓
      Read all legacy localStorage keys
        (mistralAPIKey, openwebuiBaseURL, etc.)
      ↓
      Build new Settings object
      ↓
      Validate with Zod schema
      ↓
      Save to 'word-gpt-plus-settings-v2'
      ↓
      Return migrated settings
```

### 2. Chat Request Flow

```
User sends message
  ↓
HomePage.vue: getChatResponse(messages)
  ↓
Build provider options from settings
  ↓
  provider: 'mistral'
  mistralAPIKey: settings.mistral.apiKey
  mistralModel: settings.mistral.model
  temperature: settings.mistral.temperature
  maxTokens: settings.mistral.maxTokens
  ↓
union.ts: getChatResponse(options)
  ↓
ModelCreators['mistral'](options)
  ↓
new MistralChat({ apiKey, model, ... })
  ↓
executeChatFlow(model, options)
  ↓
agent.stream(messages, { signal, threadId })
  ↓
for await (chunk of stream)
  ↓
  options.onStream(fullContent)
    ↓
    HomePage.vue updates UI
```

### 3. RAG Query Flow (OpenWebUI)

```
User enables RAG in settings
  ↓
Select knowledge bases
  ↓
settings.value.openwebui.knowledgeBase = {
  enabled: true,
  selectedCollections: ['kb-id-1', 'kb-id-2'],
  searchType: 'similarity',
  topK: 5
}
  ↓
User sends chat message
  ↓
Before sending to LLM:
  queryKnowledge(baseURL, jwtToken, message, {
    collections: settings.openwebui.knowledgeBase.selectedCollections,
    searchType: settings.openwebui.knowledgeBase.searchType,
    topK: settings.openwebui.knowledgeBase.topK
  })
  ↓
Retrieve relevant documents
  ↓
Augment user message with context
  ↓
Send to LLM with context
```

---

## MIGRATION GUIDE

### For Users

**Upgrading from v2.0.0 to v2.0.1:**

No action required! Settings migration is automatic.

1. Install v2.0.1
2. Open Word GPT Plus
3. Your settings are automatically migrated
4. All providers continue to work

**What Happens:**
- Legacy localStorage keys are read
- New `word-gpt-plus-settings-v2` object is created
- Legacy keys remain (for backwards compatibility)
- All future changes save to new system

### For Developers

#### Adding a New Provider

**Step 1: Define TypeScript Interface**

File: [src/api/types.ts](src/api/types.ts)

```typescript
export interface NewProviderOptions extends BaseChatCompletionOptions {
  provider: 'newprovider'
  newproviderAPIKey: string
  newproviderModel: string
  // ... other options
}

export type ProviderOptions =
  | OpenAIOptions
  | AzureOptions
  // ... existing providers
  | NewProviderOptions  // Add here
```

**Step 2: Add to Settings Schema**

File: [src/settings/schema.ts](src/settings/schema.ts)

```typescript
export const SettingsSchema = z.object({
  provider: z.enum([
    'official', 'azure', 'gemini', 'groq', 'mistral', 'ollama', 'openwebui',
    'newprovider'  // Add here
  ]),

  // Add provider settings
  newprovider: z.object({
    apiKey: z.string().default(''),
    model: z.string().default('default-model'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(800),
  }),

  // ... rest of schema
})

// Add to defaultSettings
export const defaultSettings: Settings = {
  // ... existing defaults
  newprovider: {
    apiKey: '',
    model: 'default-model',
    temperature: 0.7,
    maxTokens: 800,
  },
}
```

**Step 3: Implement Provider**

File: [src/api/union.ts](src/api/union.ts)

```typescript
const ModelCreators: Record<string, (opts: any) => BaseChatModel> = {
  // ... existing providers

  newprovider: (opts: NewProviderOptions) => {
    return new ChatNewProvider({
      apiKey: opts.newproviderAPIKey,
      model: opts.newproviderModel,
      temperature: opts.temperature ?? 0.7,
      maxTokens: opts.maxTokens ?? 800,
    })
  },
}
```

**Step 4: Add Model List**

File: [src/utils/constant.ts](src/utils/constant.ts)

```typescript
export const availableAPIs: IStringKeyMap = {
  // ... existing
  newprovider: 'newprovider',
}

export const availableModelsForNewProvider: string[] = [
  'model-1',
  'model-2',
  'model-3',
]
```

**Step 5: Add to HomePage Provider Configs**

File: [src/pages/HomePage.vue](src/pages/HomePage.vue)

```typescript
const providerConfigs = {
  // ... existing
  newprovider: {
    provider: 'newprovider',
    newproviderAPIKey: settings.newprovider.apiKey,
    newproviderModel: settings.newprovider.model,
    maxTokens: settings.newprovider.maxTokens,
    temperature: settings.newprovider.temperature,
  },
}
```

**Step 6: Add Authentication Check**

File: [src/utils/common.ts](src/utils/common.ts)

```typescript
export function checkAuth(auth: Auth): boolean {
  switch (auth.type) {
    // ... existing
    case 'newprovider':
      return !!auth.newproviderAPIKey
    default:
      return false
  }
}
```

**Step 7: Add Translations**

Files: [src/i18n/locales/en.json](src/i18n/locales/en.json), [src/i18n/locales/zh-cn.json](src/i18n/locales/zh-cn.json)

```json
{
  "newproviderAPIKeyLabel": "API Key",
  "newproviderAPIKeyPlaceholder": "Enter your NewProvider API key",
  "newproviderModelSelectLabel": "Model",
  "newproviderModelSelectPlaceholder": "Select a model",
  // ... other labels
}
```

Done! Your provider is now fully integrated.

---

## DEVELOPMENT GUIDELINES

### Code Style

1. **TypeScript Strict Mode:** Currently disabled, but prefer strict typing
2. **Linting:** Run `npm run lint` before committing
3. **Formatting:** Auto-format with Prettier
4. **Naming:**
   - Components: PascalCase (e.g., `OpenWebUIRagSettings.vue`)
   - Files: kebab-case (e.g., `openwebui-rag.ts`)
   - Functions: camelCase (e.g., `fetchKnowledgeBases`)
   - Constants: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`)

### Testing

**Current Status:** No automated tests

**Recommended Testing:**
```bash
# Manual testing checklist
1. Build succeeds: npm run build
2. Linting passes: npm run lint
3. All providers work in UI
4. Settings migration works (clear localStorage, reload)
5. RAG features work (OpenWebUI only)
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/new-provider

# Make changes
git add .
git commit -m "feat: Add NewProvider integration"

# Push
git push origin feature/new-provider

# Create PR
gh pr create --title "Add NewProvider integration" --body "..."
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add Mistral provider integration
fix: Resolve CORS issues in MistralChat
docs: Update ARCHITECTURE.md with new providers
refactor: Modularize word tools
perf: Optimize bundle size with code splitting
test: Add unit tests for settings migration
chore: Update dependencies
```

---

## FAQ

### Q1: Why are there two settings systems?

**A:** Version 2.0.1 completed the migration to the new Zod-based schema system. The old `settingForm.ts` system is still present for backwards compatibility but is no longer used. All providers now use the new `useSettings()` composable.

### Q2: How do I add custom models to a provider?

**A:** Use the "Custom Model" field in Settings:

1. Go to Settings
2. Select your provider
3. Click "Add Custom Model"
4. Enter model name
5. Model appears in dropdown

Models are stored in `settings.value.tools.customModels`.

### Q3: What's the difference between OpenAI and OpenWebUI providers?

| Feature | OpenAI (official) | OpenWebUI |
|---------|-------------------|-----------|
| API Endpoint | api.openai.com | Your OpenWebUI instance |
| Authentication | API Key | JWT Token |
| Models | OpenAI models only | Any (Ollama, OpenAI, Mistral, Gemini) |
| RAG Support | No | Yes |
| Local Models | No | Yes (via Ollama) |

### Q4: How does RAG work with OpenWebUI?

RAG (Retrieval-Augmented Generation) queries your knowledge bases before sending messages to the LLM:

1. Enable RAG in Settings > OpenWebUI
2. Select knowledge bases to query
3. When you send a message:
   - OpenWebUI searches your knowledge bases
   - Relevant documents are retrieved
   - Context is added to your prompt
   - LLM responds with knowledge base context

### Q5: Why does Mistral use a custom implementation?

The OpenAI SDK adds custom headers that trigger CORS preflight requests, which Mistral's API rejects. Our custom `MistralChat` class uses direct `fetch()` calls with minimal headers to avoid CORS issues.

### Q6: Can I use the old localStorage keys?

**For Reading:** Yes, they still exist for backwards compatibility.
**For Writing:** No, all writes go to `word-gpt-plus-settings-v2`.

The migration ensures old keys are read on first load, then everything uses the new system.

### Q7: How do I debug settings issues?

```javascript
// In browser console
localStorage.getItem('word-gpt-plus-settings-v2')

// Parse it
JSON.parse(localStorage.getItem('word-gpt-plus-settings-v2'))

// Check legacy keys
localStorage.getItem('mistralAPIKey')
localStorage.getItem('openwebuiBaseURL')

// Clear all settings (start fresh)
localStorage.clear()
```

### Q8: What happens if my settings get corrupted?

The system includes automatic recovery:

1. **Auto-Correction:** Fixes common issues (missing fields, wrong types)
2. **Partial Recovery:** Recovers individual fields if possible
3. **Fallback to Defaults:** Uses default settings if recovery fails

See [SettingsStorage.attemptPartialRecovery()](src/settings/storage.ts#L122) for details.

### Q9: Can I add my own tools?

Yes! Word tools are modular:

1. Create new file in `src/utils/wordTools/`
2. Define tool interface:
```typescript
export const myTools: Record<string, WordToolDefinition> = {
  myTool: {
    name: 'myTool',
    description: 'Does something useful',
    inputSchema: { ... },
    execute: async (args) => { ... }
  }
}
```
3. Export from [wordTools/index.ts](src/utils/wordTools/index.ts)
4. Tool is automatically available to agents

### Q10: How do I deploy a new version?

```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Build
npm run build

# 3. Test build
# (Open dist/index.html in browser)

# 4. Commit
git add .
git commit -m "chore: Release v2.0.2"

# 5. Tag
git tag v2.0.2

# 6. Push
git push && git push --tags

# 7. Create release
gh release create v2.0.2 --generate-notes
```

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 2.0.1 | 2026-01-04 | Complete settings migration, all providers in schema, linting fixes |
| 2.0.0 | 2026-01-04 | New architecture, RAG support, error handling, activity logging |
| 1.x | Pre-fork | Original Word GPT Plus (5 providers) |

---

## CONTRIBUTING

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint`
5. Run `npm run build`
6. Create a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## LICENSE

Same as upstream Word GPT Plus project.

---

## SUPPORT

- Issues: [GitHub Issues](https://github.com/hyperion14/word-GPT-Plus-for-mistral.ai-and-openwebui/issues)
- Discussions: [GitHub Discussions](https://github.com/hyperion14/word-GPT-Plus-for-mistral.ai-and-openwebui/discussions)
- Upstream: [Word GPT Plus](https://github.com/Kuingsmile/word-GPT-Plus)

---

**Last Updated:** January 4, 2026
**Maintainer:** hyperion14
**Fork Source:** [Kuingsmile/word-GPT-Plus](https://github.com/Kuingsmile/word-GPT-Plus)
