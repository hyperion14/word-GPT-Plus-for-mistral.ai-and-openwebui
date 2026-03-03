# INSTALLING.md - Word GPT Plus (Mistral + OpenWebUI) for BHK

## Compatibility Check: Plugin vs Open WebUI v0.8.5

### Core API Compatibility

| Feature | Plugin Calls | Open WebUI v0.8.5 Endpoint | Status |
|---------|-------------|---------------------------|--------|
| Chat Completions | `POST {baseURL}/api/v1/chat/completions` | `POST /api/v1/chat/completions` | COMPATIBLE - Verified working |
| Model Discovery | `GET {baseURL}/api/v1/models` | `GET /api/v1/models` | COMPATIBLE - Returns 21 models |
| Auth Verification | `GET {baseURL}/api/v1/auths/` | `GET /api/v1/auths/` | COMPATIBLE - JWT token verified |
| Streaming (SSE) | LangChain ChatOpenAI streaming | `text/event-stream` with `data: {json}` | COMPATIBLE |
| Knowledge Bases | `GET {baseURL}/api/v1/knowledge/` | `GET /api/v1/knowledge/` | COMPATIBLE - Fixed, returns 4 KBs |
| Knowledge Files | `GET {baseURL}/api/v1/knowledge/{id}/files` | `GET /api/v1/knowledge/{id}/files` | COMPATIBLE - Fixed, returns file list |
| Knowledge Query | `POST {baseURL}/api/v1/retrieval/query/collection` | `POST /api/v1/retrieval/query/collection` | COMPATIBLE - Fixed, returns documents |

### Proxy Route Compatibility

| Route | Expected Target | Status |
|-------|----------------|--------|
| `localhost:3100/bhk-api/` | `bhk-open-webui:8080` | WORKING - Fixed with DNS resolver |
| `localhost:3100/jachat-api/` | `jachat-open-webui:8080` | Not tested (jachat may not be running) |
| `wordai.hekanet.de/api/` | `bhk-open-webui:8080/api/` | Returns HTML instead of JSON |
| Direct: `localhost:3000/api/v1/...` | `bhk-open-webui:8080` | WORKING |
| Direct: `chat.bhk-x.de/api/v1/...` | `bhk-open-webui:8080` | WORKING |

### CORS Configuration

bhk-openwebui allows these origins (set in `docker-compose.yml`):

| Origin | Matches Plugin? |
|--------|----------------|
| `http://localhost:3100` | YES - Plugin dev/local |
| `https://wordai.hekanet.de` | YES - Plugin production |
| `http://localhost:5173` | YES - Vite dev server |
| `http://localhost:3000` | No (this is bhk-openwebui itself) |
| `https://chat.bhk-x.de` | No (this is the chat frontend) |

### Known Issues

1. **~~RAG/Knowledge Base endpoints are broken~~** - FIXED. Updated `src/api/openwebui-rag.ts` to use correct Open WebUI v0.8.5 paths: `GET /api/v1/knowledge/`, `GET /api/v1/knowledge/{id}/files`, and `POST /api/v1/retrieval/query/collection`.

2. **~~Internal nginx proxy returns 502~~** - FIXED. Added `resolver 127.0.0.11 valid=30s ipv6=off;` and variable-based upstreams to `nginx.conf`. The proxy now resolves Docker container names dynamically. Timeouts also increased from 60s to 300s.

3. **External API proxy returns HTML** - `wordai.hekanet.de/api/` returns the Open WebUI HTML frontend instead of JSON API responses. This appears to be a Host header or auth forwarding issue in the nginx-proxy config.

4. **Agent mode disabled for OpenWebUI** - By design, the plugin falls back to normal chat mode when using OpenWebUI as provider (tool calling not supported through the OpenAI-compatible proxy).

### What Works

- Chat with all 7 providers (OpenAI, Azure, Gemini, Groq, Ollama, Mistral, OpenWebUI)
- Streaming responses with real-time token display
- Model discovery and selection for OpenWebUI (21 models including custom ones)
- JWT authentication with bhk-openwebui
- Quick actions (Translate, Polish, Academic, Summary, Grammar)
- Word document integration (read selection, insert/replace/append text)
- Agent mode with 24 Word tools + 4 general tools (all providers except OpenWebUI)
- Dark mode support
- i18n (English + Chinese)
- Custom prompts management

---

## Prerequisites

- **Microsoft Word** (Desktop version for Windows or Mac with Office Add-in support)
  - Word 2016 or later
  - Microsoft 365 (recommended)
  - Word Online (web version) also works
- **Network access** to the plugin server (`localhost:3100` or `wordai.hekanet.de`)
- **JWT Token or API Key** from your Open WebUI instance

---

## Installation

### Method 1: Sideload in Word Desktop (Recommended for BHK)

The plugin is already running as a Docker container (`word-plugin-v201`) on port 3100.

#### Windows

1. Open Microsoft Word
2. Go to **File** > **Options** > **Trust Center** > **Trust Center Settings**
3. Select **Trusted Add-in Catalogs**
4. In the **Catalog URL** field, enter: `\\localhost\share` (or the network path where you'll place the manifest)
5. Click **Add Catalog** and check **Show in Menu**
6. Click **OK** to close all dialogs

**Alternative - Direct Sideload:**

1. Open Word
2. Go to **Insert** tab > **My Add-ins** > **Manage My Add-ins**
3. Click **Upload My Add-in**
4. Browse to and select the manifest file:
   ```
   manifest-docker-3100.xml
   ```
5. Click **Upload**
6. The "GPT Plus" button appears on the **Home** tab ribbon

#### Mac

1. Open Word
2. Go to **Insert** > **Add-ins** > **My Add-ins**
3. Click the dropdown arrow, select **Upload My Add-in**
4. Navigate to `manifest-docker-3100.xml` and click **Upload**

#### Word Online (Office 365)

1. Open Word Online at https://www.office.com
2. Open any document
3. Go to **Insert** > **Office Add-ins**
4. Click **Upload My Add-in** (top-right)
5. Upload `manifest-docker-3100.xml`

### Method 2: Admin Deployment (Organization-wide)

For deploying to all BHK users via Microsoft 365 Admin Center:

1. Go to https://admin.microsoft.com
2. Navigate to **Settings** > **Integrated apps** > **Upload custom apps**
3. Choose **Office Add-in**
4. Upload `manifest-docker-3100.xml`
5. Assign to specific users or the entire organization
6. Users will see "GPT Plus" automatically in their Word ribbon

### Method 3: Build and Run Locally (Development)

```bash
cd /home/developer/projects/production/word-GPT-Plus-for-mistral-and-openwebui/

# Install dependencies
npm install
# or
yarn install

# Start dev server (port 5173 by default)
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build
```

For local development, use the Vite dev server manifest (adjust URLs to `localhost:5173`).

---

## Configuration for BHK Open-WebUI

### Step 1: Open the Plugin

1. In Word, click the **GPT Plus** button on the Home tab ribbon
2. The taskpane opens on the right side

### Step 2: Go to Settings

1. Click the gear icon (top-right of the taskpane)
2. Navigate to the **Provider** tab

### Step 3: Select OpenWebUI Provider

1. In the **API Provider** dropdown, select **openwebui**
2. Fill in the following fields:

| Field | Value for BHK Setup |
|-------|---------------------|
| **Open-WebUI URL** | `https://chat.bhk-x.de` |
| **Plugin URL** | `http://localhost:3100` (local) or `https://wordai.hekanet.de` (external) |
| **JWT Token** | Your JWT token from bhk-openwebui |
| **Instance** | `bhk` (or `custom` if using direct URL) |

The **Base URL** field is auto-computed:
- For `bhk` instance: `http://localhost:3100/bhk-api`
- For `custom`: Uses the Open-WebUI URL directly

### Step 4: Select a Model

1. Click the **Refresh** button next to the model dropdown
2. Available models will be fetched from bhk-openwebui
3. Select your preferred model (e.g., `mistral-large-latest` or `aktenknecht`)

### Step 5: Test the Connection

1. Go back to the Home page (click back arrow)
2. Type a test message: "Hallo, was ist ein Werkvertrag?"
3. Click **Send**
4. You should see a streaming response from Mistral AI via bhk-openwebui

### Alternative: Use Mistral Directly

If the OpenWebUI proxy has issues, you can use Mistral AI directly:

1. Select **mistral** as provider
2. Enter your Mistral API key
3. Select model (e.g., `mistral-large-latest`)
4. This bypasses Open WebUI entirely - no proxy needed

---

## Obtaining Your JWT Token

### From the Browser

1. Log into https://chat.bhk-x.de
2. Open browser DevTools (F12)
3. Go to **Application** > **Local Storage** > `https://chat.bhk-x.de`
4. Find the key `token` - copy its value
5. Paste into the plugin's JWT Token field

### From the API (API Key)

If API keys are enabled, you can also use an API key (`sk-...` format):

1. Log into https://chat.bhk-x.de
2. Click avatar > **Settings** > **Account**
3. Under **API Keys**, create a new key
4. Use the key in the JWT Token field (the plugin accepts both formats)

---

## Docker Deployment

The plugin is already deployed as container `word-plugin-v201`.

### Current Running Configuration

```
Container: word-plugin-v201
Image:     word-gpt-plus-for-mistral-and-openwebui-word-gpt-plus
Ports:     0.0.0.0:3100 -> 80/tcp
Status:    Up 6 days
Networks:  bhk-rag-network, jachat-network
```

### Rebuild After Code Changes

```bash
cd /home/developer/projects/production/word-GPT-Plus-for-mistral-and-openwebui/

# Build the Vue app
yarn build

# Rebuild Docker image
docker build -t word-gpt-plus-for-mistral-and-openwebui-word-gpt-plus .

# Restart container
docker stop word-plugin-v201
docker rm word-plugin-v201
docker compose up -d
```

### Internal Nginx Proxy Routes

The container's nginx serves the Vue app and proxies API requests:

| Route | Target | Purpose |
|-------|--------|---------|
| `/` | Local `/usr/share/nginx/html` | Vue SPA |
| `/bhk-api/*` | `bhk-open-webui:8080/*` | BHK OpenWebUI API |
| `/jachat-api/*` | `jachat-open-webui:8080/*` | Jachat OpenWebUI API |
| `/openwebui-api/*` | `jachat-open-webui:8080/*` | Legacy path |

### External Access via wordai.hekanet.de

The external nginx proxy (`nginx-proxy`) routes:
- `https://wordai.hekanet.de/` → Word plugin (port 3100)
- `https://wordai.hekanet.de/api/` → bhk-openwebui API (port 8080)

---

## Manifest Configuration

The Office Add-in manifest defines where Word loads the plugin from.

**Current manifest:** `manifest-docker-3100.xml`

| Setting | Value |
|---------|-------|
| Add-in ID | `6b20e038-5f8e-4e3b-8481-976c5a9c0bc3` |
| Version | 2.0.1.0 |
| Source URL | `http://localhost:3100/index.html` |
| Permissions | ReadWriteDocument |
| Ribbon | Home tab > GPT group > GPT Plus button |

### Creating a Custom Manifest

If you need different URLs (e.g., `https://wordai.hekanet.de`):

1. Copy `manifest-docker-3100.xml`
2. Replace all `http://localhost:3100` with your target URL
3. Generate a new unique GUID for `<Id>` if deploying alongside the original
4. Sideload the new manifest

---

## Troubleshooting

### Plugin doesn't load in Word
- Ensure the container is running: `docker ps | grep word-plugin`
- Test the URL in a browser: `http://localhost:3100/`
- Check Word's add-in trust settings
- Try clearing Word's add-in cache:
  - Windows: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
  - Mac: `~/Library/Containers/com.microsoft.Word/Data/Documents/wef/`

### "No API Key" error
- Go to Settings > Provider tab
- Ensure OpenWebUI is selected and JWT token is filled in
- JWT tokens expire - get a fresh one if it stopped working

### Model list is empty
- Click the Refresh button next to model dropdown
- Check that the base URL resolves correctly
- Verify JWT token is valid: test in browser DevTools console

### 502 Bad Gateway through proxy
- The `/bhk-api/` proxy has a DNS resolution issue
- **Workaround**: Use direct URL instead:
  - Set Instance to `custom`
  - Set Open-WebUI URL to `https://chat.bhk-x.de`
  - The plugin will call the API directly (CORS is configured to allow this)

### Streaming stops mid-response
- Check network timeout settings
- The container nginx has 60s proxy timeouts - long responses may get cut off
- Consider increasing `proxy_read_timeout` to 300s

### Agent mode shows warning for OpenWebUI
- This is expected - OpenWebUI's OpenAI-compatible API doesn't support tool calling
- The plugin falls back to normal chat mode automatically
- Use Mistral directly if you need agent mode with tools

### Dark mode not working
- The plugin respects the system dark mode preference (`prefers-color-scheme: dark`)
- Force dark mode via Word's appearance settings

---

## File Locations

| What | Where |
|------|-------|
| Plugin Source | `/home/developer/projects/production/word-GPT-Plus-for-mistral-and-openwebui/` |
| Manifest | `manifest-docker-3100.xml` |
| Vue Entry | `src/main.ts` |
| Chat Page | `src/pages/HomePage.vue` |
| Settings Page | `src/pages/SettingsPage.vue` |
| OpenWebUI API Client | `src/api/openwebui.ts` |
| OpenWebUI RAG Client | `src/api/openwebui-rag.ts` |
| Provider Factory | `src/api/union.ts` |
| Mistral Client | `src/api/mistralChat.ts` |
| URL Resolver | `src/composables/useOpenWebUIInstance.ts` |
| Settings Schema | `src/settings/schema.ts` |
| Word Tools | `src/utils/wordTools/` |
| Container nginx | Inside `word-plugin-v201:/etc/nginx/conf.d/default.conf` |
| External nginx | `/home/developer/projects/production/nginx-docker/conf.d/wordai.hekanet.de.conf` |
| Dockerfile | `Dockerfile` |
| Docker Compose Template | `docker-compose.template.yml` |
