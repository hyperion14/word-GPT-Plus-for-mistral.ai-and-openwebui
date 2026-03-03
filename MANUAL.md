# MANUAL - Word GPT Plus v2.0.1 (Mistral + OpenWebUI)

## Table of Contents

1. [Overview](#1-overview)
2. [User Guide](#2-user-guide)
3. [Provider Configuration](#3-provider-configuration)
4. [BHK Open-WebUI Integration](#4-bhk-open-webui-integration)
5. [Agent Mode & Tools](#5-agent-mode--tools)
6. [Settings Reference](#6-settings-reference)
7. [Architecture](#7-architecture)
8. [Administration](#8-administration)
9. [API Compatibility Reference](#9-api-compatibility-reference)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Overview

Word GPT Plus is a Microsoft Word Add-in that integrates AI capabilities directly into the Word taskpane. It supports 7 AI providers and can read/write Word document content.

### Key Features

- Chat with AI models directly in Word
- 7 AI providers: OpenAI, Azure, Gemini, Groq, Ollama, Mistral AI, Open WebUI
- Agent mode with 28 tools (24 Word tools + 4 general tools)
- Quick actions: Translate, Polish, Academic, Summary, Grammar
- Real-time streaming responses
- Insert AI responses into documents (replace, append, new line)
- Custom prompts management
- Dark mode support
- Bilingual (English + Chinese)

### System Requirements

| Requirement | Minimum |
|------------|---------|
| Microsoft Word | 2016 or later / Microsoft 365 / Word Online |
| Browser (for Word Online) | Chrome, Edge, Firefox, Safari (latest) |
| Network | Access to plugin server (port 3100 or wordai.hekanet.de) |
| API Credentials | JWT token or API key for your chosen provider |

---

## 2. User Guide

### 2.1 Opening the Plugin

1. Open Microsoft Word
2. Go to the **Home** tab on the ribbon
3. Click the **GPT Plus** button (in the "GPT" group)
4. The taskpane opens on the right side of the document

### 2.2 Chat Interface

```
┌──────────────────────────────────────┐
│  ✨ Word GPT+              [+] [⚙]  │  Header: New Chat / Settings
├──────────────────────────────────────┤
│  [🌐] [✨] [📖] [📄] [✓] [Prompt▼]│  Quick Actions + Prompt Selector
├──────────────────────────────────────┤
│                                      │
│  💬 User: What is a Werkvertrag?     │  Chat Messages
│                                      │
│  🤖 AI: A Werkvertrag is...         │  (with Replace/Append/Copy buttons)
│      [📄] [+] [📋]                  │
│                                      │
├──────────────────────────────────────┤
│  [Ask] [Agent] | [Provider▼] [Model▼]│  Mode + Provider + Model
├──────────────────────────────────────┤
│  [Type your message...       ] [▶]   │  Input + Send/Stop
│  ☑ Include Selected Text             │  Options
│  ☑ Use Word Formatting               │
└──────────────────────────────────────┘
```

### 2.3 Sending a Message

1. Type your question in the input field at the bottom
2. Press **Enter** or click the **Send** button
3. The AI response streams in real-time

**Options:**
- **Include Selected Text**: When checked, any text selected in the Word document is automatically appended to your message
- **Use Word Formatting**: When checked, AI responses are inserted with formatting (bold, lists, etc.)

### 2.4 Quick Actions

Select text in your Word document first, then click a quick action button:

| Button | Action | What It Does |
|--------|--------|--------------|
| 🌐 | Translate | Translates selected text to target language |
| ✨ | Polish | Improves grammar, vocabulary, and flow |
| 📖 | Academic | Rewrites in scholarly academic style |
| 📄 | Summary | Creates a concise summary |
| ✓ | Grammar | Fixes spelling and grammar errors |

### 2.5 Custom Prompts

1. Go to **Settings** > **Prompts** tab
2. Create prompts with system + user prompt templates
3. Saved prompts appear in the prompt dropdown on the home page
4. Select a prompt to pre-fill the system context and user input

### 2.6 Inserting Responses into Documents

Each AI response has three action buttons:

| Button | Action | Description |
|--------|--------|-------------|
| 📄 | Replace | Replaces the currently selected text in the document |
| + | Append | Adds the response after the current selection |
| 📋 | Copy | Copies to clipboard |

### 2.7 Switching Providers

1. Use the **Provider** dropdown at the bottom of the chat
2. Use the **Model** dropdown to select a specific model
3. Changes take effect immediately for the next message

### 2.8 New Chat

Click the **+** button in the header to:
- Clear chat history
- Reset the conversation thread
- Clear any custom prompt selection

---

## 3. Provider Configuration

### 3.1 OpenAI

| Setting | Value |
|---------|-------|
| API Key | Your OpenAI API key (`sk-...`) |
| Base URL | `https://api.openai.com/v1` (default) |
| Models | GPT-5, GPT-4o, O3, O4-mini, etc. |

### 3.2 Mistral AI (Direct)

| Setting | Value |
|---------|-------|
| API Key | Your Mistral API key |
| Base URL | `https://api.mistral.ai/v1` (default) |
| Models | mistral-large-latest, mistral-medium-latest, mistral-small-latest, ministral-14b, codestral-latest |

The plugin uses a custom implementation (not OpenAI SDK) for Mistral to avoid CORS issues. Streaming is fully supported.

### 3.3 Open WebUI (via BHK)

See [Section 4](#4-bhk-open-webui-integration) for detailed BHK setup.

| Setting | Value |
|---------|-------|
| Open-WebUI URL | `https://chat.bhk-x.de` |
| Plugin URL | `http://localhost:3100` or `https://wordai.hekanet.de` |
| JWT Token | From browser login or API key |
| Instance | `bhk` or `custom` |

### 3.4 Azure OpenAI

| Setting | Value |
|---------|-------|
| API Key | Azure API key |
| Endpoint | Your Azure endpoint URL |
| Deployment Name | Your model deployment name |
| API Version | `2024-10-01` (default) |

### 3.5 Google Gemini

| Setting | Value |
|---------|-------|
| API Key | Google AI API key |
| Models | gemini-3-pro, gemini-2.5-flash, etc. |

### 3.6 Groq

| Setting | Value |
|---------|-------|
| API Key | Groq API key |
| Models | llama-3.3-70b-versatile, etc. |

### 3.7 Ollama (Self-hosted)

| Setting | Value |
|---------|-------|
| Endpoint | `http://localhost:11434` (default) |
| Models | Your downloaded Ollama models |
| No API key required | |

---

## 4. BHK Open-WebUI Integration

### 4.1 Architecture

```
Microsoft Word                     Plugin Server              BHK Infrastructure
┌──────────┐                    ┌───────────────┐          ┌──────────────────┐
│ Word      │                   │ word-plugin   │          │ bhk-open-webui   │
│ Taskpane  │ ──loads HTML──▶  │ (port 3100)   │          │ (port 3000/8080) │
│           │                   │               │          │                  │
│ Vue 3 App │ ──API calls──▶   │ /bhk-api/* ───┼────▶    │ Mistral AI       │
│ LangChain │                   │               │          │ Voyage AI        │
│           │                   │ Static files  │          │ Jina AI          │
└──────────┘                    └───────────────┘          │ PostgreSQL       │
                                                           └──────────────────┘
      OR (direct mode)
┌──────────┐                                               ┌──────────────────┐
│ Word      │ ─── direct API calls ───────────────────▶   │ bhk-open-webui   │
│ Taskpane  │      (chat.bhk-x.de)                        │ (port 3000)      │
└──────────┘                                               └──────────────────┘
```

### 4.2 URL Resolution Logic

The plugin resolves API URLs based on the user-friendly Open-WebUI URL and plugin URL:

```
User sets:
  Open-WebUI URL:  https://chat.bhk-x.de
  Plugin URL:      http://localhost:3100

Plugin resolves:
  Domain extracted: chat.bhk-x.de
  DOMAIN_PROXY_MAP lookup: chat.bhk-x.de → /bhk-api
  Resolved Base URL: http://localhost:3100/bhk-api

LangChain ChatOpenAI uses:
  baseURL = http://localhost:3100/bhk-api/api/v1
  Full endpoint = http://localhost:3100/bhk-api/api/v1/chat/completions
```

**Domain-to-Proxy Mapping:**

| Domain | Proxy Path | Target |
|--------|-----------|--------|
| `chat.bhk-x.de` | `/bhk-api` | bhk-open-webui |
| `localhost:3000` | `/bhk-api` | bhk-open-webui |
| `jachat.hekanet.de` | `/jachat-api` | jachat-open-webui |
| `localhost:3010` | `/jachat-api` | jachat-open-webui |
| `wordai.hekanet.de` | (none - direct) | wordai external |
| Any other | (direct) | Custom URL as-is |

### 4.3 Recommended Setup for BHK

**Option A: Direct Connection (Most Reliable)**

Use when the browser running Word has direct access to `chat.bhk-x.de`:

| Setting | Value |
|---------|-------|
| Instance | `custom` |
| Open-WebUI URL | `https://chat.bhk-x.de` |
| Plugin URL | `http://localhost:3100` |
| Base URL | (auto: `https://chat.bhk-x.de`) |

This bypasses the container proxy and calls bhk-openwebui directly. CORS is configured to allow `http://localhost:3100`.

**Option B: Via Container Proxy**

| Setting | Value |
|---------|-------|
| Instance | `bhk` |
| Open-WebUI URL | `https://chat.bhk-x.de` |
| Plugin URL | `http://localhost:3100` |
| Base URL | (auto: `http://localhost:3100/bhk-api`) |

Note: The `/bhk-api/` proxy currently has a DNS resolution issue (returns 502). Use Option A until this is fixed.

**Option C: Via External Domain**

For access outside the local network:

| Setting | Value |
|---------|-------|
| Instance | `jachat-external` |
| Open-WebUI URL | `https://wordai.hekanet.de` |
| Plugin URL | `https://wordai.hekanet.de` |
| Base URL | (auto: `https://wordai.hekanet.de`) |

### 4.4 Available BHK Models

When connected to bhk-openwebui, these models are available:

| Model ID | Description |
|----------|-------------|
| `aktenknecht` | Custom BHK model (based on mistral-large-latest) with file upload, web search, citations |
| `mistral-large-latest` | Mistral Large (general purpose) |
| `mistral-medium-latest` | Mistral Medium |
| `mistral-small-latest` | Mistral Small (fast, economical) |
| `magistral-medium-latest` | Magistral Medium (reasoning model) |
| `magistral-small-latest` | Magistral Small (reasoning model) |
| `ministral-14b-latest` | Ministral 14B |
| `ministral-3b-latest` | Ministral 3B (fastest) |
| `bhk_diktat_pipe.bhk-diktat` | BHK Dictation pipeline |
| `bhk_stiltraining_pipe.bhk-stiltraining` | BHK Style Training pipeline |
| `jur-schreibassisten` | Legal Writing Assistant |
| `vergabe` | Public Procurement Law specialist |
| `voxtral-mini-latest` | Voxtral Mini (speech model) |

### 4.5 Obtaining a JWT Token

**Method 1: From Browser DevTools**

1. Open https://chat.bhk-x.de and log in
2. Press F12 to open DevTools
3. Go to **Application** > **Local Storage** > `https://chat.bhk-x.de`
4. Copy the value of the `token` key
5. Paste into the plugin settings

**Method 2: API Key (Recommended - Doesn't Expire)**

1. Log into https://chat.bhk-x.de
2. Click your avatar (bottom-left) > **Settings**
3. Go to **Account** tab
4. Scroll to **API Keys**
5. Click **Create new secret key**
6. Copy the key (`sk-...` format)
7. Use this in the plugin's JWT Token field

---

## 5. Agent Mode & Tools

### 5.1 Ask vs Agent Mode

| Feature | Ask Mode | Agent Mode |
|---------|---------|------------|
| Simple chat | Yes | Yes |
| Tool calling | No | Yes |
| Word document tools | No | Yes |
| Web search | No | Yes |
| Provider support | All 7 | 6 (not OpenWebUI) |
| Speed | Faster | Slower (multi-step) |

### 5.2 Word Document Tools (24 tools)

**Text Operations:**

| Tool | Description |
|------|-------------|
| `getSelectedText` | Read the currently selected text |
| `getDocumentContent` | Read entire document content |
| `insertText` | Insert text at cursor position |
| `replaceSelectedText` | Replace selected text |
| `appendText` | Append text after selection |
| `deleteText` | Delete selected content |
| `insertParagraph` | Insert a new paragraph |

**Formatting:**

| Tool | Description |
|------|-------------|
| `formatText` | Apply bold, italic, underline |
| `setFontName` | Change font family |
| `clearFormatting` | Remove all formatting |

**Structure:**

| Tool | Description |
|------|-------------|
| `insertTable` | Create a table |
| `insertList` | Create bullet/numbered list |
| `insertPageBreak` | Insert page break |
| `insertImage` | Insert image from URL |
| `insertBookmark` | Create a bookmark |
| `insertContentControl` | Insert content control |

**Navigation & Search:**

| Tool | Description |
|------|-------------|
| `findText` | Search for text in document |
| `searchAndReplace` | Find and replace text |
| `selectText` | Select a text range |
| `goToBookmark` | Navigate to a bookmark |
| `getRangeInfo` | Get selection properties |
| `getDocumentProperties` | Get document metadata |
| `getTableInfo` | Get table information |

### 5.3 General Tools (4 tools)

| Tool | Description |
|------|-------------|
| `searchWeb` | Search the web via DuckDuckGo |
| `fetchWebContent` | Extract text from a URL (5000 char limit) |
| `getCurrentDate` | Get current date/time |
| `calculateMath` | Evaluate math expressions |

### 5.4 Enabling/Disabling Tools

1. Go to **Settings** > **Tools** tab
2. Toggle individual Word tools and general tools on/off
3. Only enabled tools are available to the agent

### 5.5 Agent Mode Example

```
User: "Read the selected text and summarize it, then insert the summary
       after the selection as a new paragraph."

Agent:
  🔧 Calling tool: getSelectedText...
  ✅ Tool getSelectedText completed
  🔧 Calling tool: insertParagraph...
  ✅ Tool insertParagraph completed

  I've read the selected text about contract law and inserted a
  concise summary after it.
```

---

## 6. Settings Reference

### 6.1 General Settings

| Setting | Options | Default |
|---------|---------|---------|
| UI Language | English, Chinese | English |
| Reply Language | English, Chinese, Auto | Auto |

### 6.2 Provider Settings

See [Section 3](#3-provider-configuration) for per-provider configuration.

### 6.3 OpenWebUI-Specific Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Open-WebUI URL | User-friendly instance URL | `http://localhost:3010` |
| Plugin URL | Plugin server URL | `http://localhost:3100` |
| Instance | Preset instance selection | `jachat` |
| JWT Token | Authentication token | (empty) |
| Base URL | Auto-computed API endpoint | (computed) |
| Model | Selected model ID | (empty) |
| Temperature | Response creativity (0-2) | 0.7 |
| Max Tokens | Maximum response length | 1024 |

### 6.4 RAG/Knowledge Base Settings (OpenWebUI only)

| Setting | Description | Default |
|---------|-------------|---------|
| Enabled | Enable RAG queries | false |
| Collections | Selected knowledge collections | [] |
| Search Type | similarity / mmr / score_threshold | similarity |
| Top K | Number of results (1-20) | 5 |

### 6.5 Prompt Settings

| Setting | Description |
|---------|-------------|
| System Prompt | Instructions for the AI's behavior |
| User Prompt | Template for user messages |
| Saved Prompts | Library of reusable prompt pairs |

### 6.6 Tool Settings

| Setting | Description |
|---------|-------------|
| Word Tools | Toggle individual Word document tools |
| General Tools | Toggle web search, fetch, math, date tools |

### 6.7 Data Storage

All settings are stored in the browser's `localStorage` (within the Word add-in webview). No data is sent to external servers other than the configured AI provider.

Key localStorage entries:
- `word-gpt-plus-settings-v2` - Main settings object
- `api` - Selected provider
- `openwebuiFetchedModels` - Cached model list
- `enabledWordTools` - Enabled word tools
- `enabledGeneralTools` - Enabled general tools
- `savedPrompts` - User's saved prompts
- `chatMode` - ask / agent

---

## 7. Architecture

### 7.1 Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | Vue 3.5 + TypeScript |
| AI Abstraction | LangChain 1.2.3 |
| UI Components | Element Plus 2.13 |
| Icons | Lucide Vue Next |
| Build Tool | Vite |
| Routing | Vue Router 4 |
| i18n | Vue I18n 11 |
| Validation | Zod 4 |
| Office Integration | Office.js |
| Container | Node.js 22 + Nginx (Docker) |

### 7.2 Source Structure

```
src/
├── main.ts                      # Entry point (Office.onReady)
├── App.vue                      # Root component
├── pages/
│   ├── HomePage.vue             # Chat interface
│   └── SettingsPage.vue         # Settings UI
├── api/
│   ├── union.ts                 # Provider factory (7 providers)
│   ├── mistralChat.ts           # Custom Mistral implementation
│   ├── openwebui.ts             # OpenWebUI model discovery
│   ├── openwebui-rag.ts         # RAG integration (v0.8.5 compatible)
│   ├── common.ts                # Word insertion utilities
│   └── types.ts                 # TypeScript interfaces
├── composables/
│   ├── useOpenWebUIInstance.ts   # URL resolution logic
│   └── useSettingsAdapter.ts    # Settings bridge
├── settings/
│   ├── schema.ts                # Zod validation schema
│   ├── storage.ts               # localStorage persistence
│   └── useSettings.ts           # Reactive settings composable
├── utils/
│   ├── wordTools/               # 24 Word document tools
│   ├── generalTools.ts          # 4 general tools
│   ├── errorHandler.ts          # Error classification
│   ├── errorRecovery.ts         # Retry/circuit breaker
│   ├── constant.ts              # Models, built-in prompts
│   ├── settingPreset.ts         # UI field definitions
│   └── ...
├── components/
│   ├── Message.vue              # Message display
│   └── OpenWebUIRagSettings.vue # RAG config UI
├── i18n/
│   └── locales/
│       ├── en.json              # English (170+ strings)
│       └── zh-cn.json           # Chinese
└── types/
    ├── providers.ts             # Provider option types
    ├── errors.ts                # Error types
    └── common.ts                # Shared types
```

### 7.3 Request Flow

```
User types message
        │
        ▼
HomePage.vue → processChat()
        │
        ├─ Build provider config from settings
        ├─ Create system message (standard or agent prompt)
        ├─ Add user message (+ optional selected text)
        │
        ▼
union.ts → getChatResponse() or getAgentResponse()
        │
        ├─ ModelCreators[provider](options) → creates LangChain model
        │     ├─ OpenAI:   ChatOpenAI
        │     ├─ Mistral:  MistralChat (custom)
        │     ├─ OpenWebUI: ChatOpenAI (with JWT + custom baseURL)
        │     └─ ...
        │
        ▼
LangChain Agent/Chat Flow
        │
        ├─ Streams tokens via onStream callback
        ├─ Updates AIMessage in history
        ├─ Auto-scrolls chat container
        │
        ▼
User clicks [Replace] [Append] [Copy]
        │
        ▼
common.ts → insertResult() / insertFormattedResult()
        │
        ▼
Office.js → Word.run() → modify document
```

### 7.4 Error Handling

The plugin has a multi-layer error handling system:

1. **Error Classification** (`errorHandler.ts`):
   - AUTHENTICATION (401/403)
   - RATE_LIMIT (429)
   - NETWORK (connection failures)
   - INVALID_MODEL (404)
   - QUOTA_EXCEEDED
   - TIMEOUT
   - SERVICE_ERROR (5xx)

2. **Error Recovery** (`errorRecovery.ts`):
   - Exponential backoff retry (1s, 2s, 4s, 8s...)
   - Circuit breaker for repeated failures
   - 30s timeout protection

3. **User-Facing Messages**:
   - Provider-specific troubleshooting guidance
   - Toast notifications via Element Plus

---

## 8. Administration

### 8.1 Container Management

```bash
# Check status
docker ps | grep word-plugin

# View logs
docker logs word-plugin-v201 --tail 100 -f

# Restart
docker restart word-plugin-v201

# Rebuild
cd /home/developer/projects/production/word-GPT-Plus-for-mistral-and-openwebui/
yarn build
docker build -t word-gpt-plus-for-mistral-and-openwebui-word-gpt-plus .
docker restart word-plugin-v201
```

### 8.2 Nginx Configuration

**Container nginx** (inside `word-plugin-v201`):
- Location: `/etc/nginx/conf.d/default.conf`
- Serves: Vue SPA + API proxy routes
- Known issue: `/bhk-api/` returns 502 (needs `resolver 127.0.0.11;`)

**External nginx** (`nginx-proxy`):
- Config: `/home/developer/projects/production/nginx-docker/conf.d/wordai.hekanet.de.conf`
- Routes: `wordai.hekanet.de` → plugin + API proxy
- SSL: Let's Encrypt

### 8.3 Updating the Plugin

```bash
cd /home/developer/projects/production/word-GPT-Plus-for-mistral-and-openwebui/

# Pull latest changes
git pull

# Install new dependencies
yarn install

# Build
yarn build

# Rebuild and restart container
docker build -t word-gpt-plus-for-mistral-and-openwebui-word-gpt-plus .
docker stop word-plugin-v201 && docker rm word-plugin-v201
# Re-run with docker compose or manual docker run
```

### 8.4 Adding Custom Models

Users can add custom model IDs that aren't in the fetched list:

1. Settings > Provider > OpenWebUI
2. In the "Custom Models" section, add model IDs
3. They appear alongside fetched models in the dropdown

### 8.5 Manifest Distribution

For organization-wide deployment:

1. Edit `manifest-docker-3100.xml` with production URLs
2. Deploy via Microsoft 365 Admin Center
3. Or distribute the manifest file to users for manual sideloading

---

## 9. API Compatibility Reference

### 9.1 Endpoints Used by the Plugin

#### Chat Completions (via LangChain ChatOpenAI)

```
POST {baseURL}/api/v1/chat/completions

Headers:
  Authorization: Bearer {jwtToken}
  Content-Type: application/json

Body:
{
  "model": "mistral-large-latest",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant..."},
    {"role": "user", "content": "What is a Werkvertrag?"}
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 1024
}

Response (streaming): Server-Sent Events
  data: {"choices":[{"delta":{"content":"A "}}]}
  data: {"choices":[{"delta":{"content":"Werkvertrag "}}]}
  ...
  data: [DONE]
```

**Open WebUI v0.8.5 Status:** COMPATIBLE

#### Model Discovery

```
GET {baseURL}/api/v1/models

Headers:
  Authorization: Bearer {jwtToken}
  Content-Type: application/json

Response:
{
  "data": [
    {"id": "aktenknecht", "name": "Aktenknecht", "object": "model", ...},
    {"id": "mistral-large-latest", "name": "mistral-large-2512", ...}
  ]
}
```

**Open WebUI v0.8.5 Status:** COMPATIBLE (returns `{data: [...]}` with model objects)

#### Auth Verification

```
GET {baseURL}/api/v1/auths/

Headers:
  Authorization: Bearer {jwtToken}

Response:
{
  "id": "7358585c-...",
  "name": "Justus Kampp",
  "role": "admin",
  "email": "admin@bhk-x.de"
}
```

**Open WebUI v0.8.5 Status:** COMPATIBLE

#### Mistral Direct (Custom Implementation)

```
POST https://api.mistral.ai/v1/chat/completions

Headers:
  Authorization: Bearer {apiKey}
  Content-Type: application/json

Body: (same as chat completions above)
```

**Status:** COMPATIBLE (direct Mistral API, not through Open WebUI)

### 9.2 Broken Endpoints (RAG)

These endpoints in `src/api/openwebui-rag.ts` do NOT match Open WebUI v0.8.5:

These endpoints have been fixed and are now compatible:

| Plugin Calls | Open WebUI Endpoint | Status |
|-------------|---------------------|--------|
| `GET /api/v1/knowledge/` | `GET /api/v1/knowledge/` | FIXED |
| `GET /api/v1/knowledge/{id}/files` | `GET /api/v1/knowledge/{id}/files` | FIXED |
| `POST /api/v1/retrieval/query/collection` | `POST /api/v1/retrieval/query/collection` | FIXED |

### 9.3 Response Format Differences

| Endpoint | Plugin Expects | Open WebUI Returns | Match? |
|----------|---------------|-------------------|--------|
| Models | `{data: [{id, name}]}` | `{data: [{id, name, ...}]}` | Yes |
| Auth | `{id, name, email, role}` | `{id, name, email, role, ...}` | Yes |
| Chat | OpenAI SSE format | OpenAI SSE format | Yes |
| Knowledge | `{data: [...]}` | `{items: [...], total: N}` | No - different key |

---

## 10. Troubleshooting

### Common Issues

#### "No API Key" when sending messages
- Go to Settings > Provider
- Ensure the JWT Token field is filled
- For OpenWebUI: also ensure Base URL is set

#### Models not loading for OpenWebUI
1. Check that the Base URL is correct
2. Click the Refresh button
3. Try the direct URL: set Instance to `custom`, use `https://chat.bhk-x.de`
4. Check browser console (F12 in Word Online) for errors

#### 502 Bad Gateway errors
- Previously caused by missing DNS resolver in container nginx - now fixed
- If it recurs after container rebuild, ensure `nginx.conf` has `resolver 127.0.0.11 valid=30s ipv6=off;`
- **Workaround**: Use Instance = `custom` with direct URL `https://chat.bhk-x.de`

#### Responses cut off mid-stream
- The container nginx has 60s proxy timeouts
- For long responses, increase `proxy_read_timeout` in the container's nginx config
- Or use the direct URL which has 300s timeout via the external nginx

#### Word says "We can't open this add-in from localhost"
- Ensure Word trusts the add-in source
- Windows: Add `http://localhost:3100` to Trusted Sites in Internet Options
- Or use the HTTPS URL `https://wordai.hekanet.de` in the manifest instead

#### Plugin taskpane is blank
- Check container is running: `docker ps | grep word-plugin`
- Test URL in browser: `http://localhost:3100/`
- Clear Office add-in cache:
  - Windows: Delete `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
  - Mac: Delete `~/Library/Containers/com.microsoft.Word/Data/Documents/wef/`

#### Agent mode shows "OpenWebUI does not support Agent mode"
- Expected behavior - OpenWebUI's proxy doesn't support LangChain tool calling
- Switch to Mistral (direct) provider for agent mode
- Or use Ask mode with OpenWebUI

#### Dark mode looks broken
- The plugin follows system dark mode preference
- In Word Desktop, go to File > Account > Office Theme > Dark Gray or Black
- CSS `prefers-color-scheme: dark` triggers automatically

### Diagnostic Commands

```bash
# Check plugin container
docker ps | grep word-plugin-v201

# Check logs
docker logs word-plugin-v201 --tail 50

# Test plugin is serving
curl -s http://localhost:3100/ | head -5

# Test API directly
curl -s http://localhost:3000/api/v1/models \
  -H "Authorization: Bearer YOUR_TOKEN" | python3 -m json.tool

# Test proxy path
curl -s http://localhost:3100/bhk-api/health

# Check container networks
docker inspect word-plugin-v201 --format '{{json .NetworkSettings.Networks}}' | python3 -m json.tool

# Test from inside container
docker exec word-plugin-v201 wget -q -O- http://bhk-open-webui:8080/health
```

---

## Appendix A: File Locations

| What | Where |
|------|-------|
| Plugin Source | `/home/developer/projects/production/word-GPT-Plus-for-mistral-and-openwebui/` |
| Manifest | `manifest-docker-3100.xml` |
| Dockerfile | `Dockerfile` |
| Docker Compose Template | `docker-compose.template.yml` |
| Vite Config | `vite.config.js` |
| TypeScript Config | `tsconfig.json` |
| Package JSON | `package.json` |
| External Nginx Config | `/home/developer/projects/production/nginx-docker/conf.d/wordai.hekanet.de.conf` |
| Container Nginx Config | `word-plugin-v201:/etc/nginx/conf.d/default.conf` |
| bhk-openwebui | `/home/developer/projects/production/bhk-openwebui/` |
| Open WebUI Upstream | `/home/developer/projects/production/open-webui/` |

## Appendix B: Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message |
| Shift+Enter | New line in input |

## Appendix C: localStorage Keys

| Key | Purpose |
|-----|---------|
| `word-gpt-plus-settings-v2` | Main settings object |
| `api` | Selected provider |
| `apiKey` | OpenAI API key |
| `mistralAPIKey` | Mistral API key |
| `openwebuiAPIKey` | OpenWebUI JWT token |
| `openwebuiBaseURL` | Computed base URL |
| `openwebuiURL` | User's OpenWebUI URL |
| `openwebuiPluginURL` | Plugin URL |
| `model` | OpenAI model selection |
| `mistralModelSelect` | Mistral model selection |
| `openwebuiModelSelect` | OpenWebUI model selection |
| `openwebuiFetchedModels` | Cached model list |
| `temperature` | Temperature setting |
| `maxTokens` | Max tokens setting |
| `chatMode` | ask / agent |
| `useWordFormatting` | Format insertion toggle |
| `useSelectedText` | Include selection toggle |
| `insertType` | replace / append / newLine |
| `enabledWordTools` | Active word tools list |
| `enabledGeneralTools` | Active general tools list |
| `savedPrompts` | User's prompt library |
| `localLanguage` | UI language |
| `replyLanguage` | AI reply language |
