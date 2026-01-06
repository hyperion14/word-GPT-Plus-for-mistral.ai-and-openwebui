<div align="center">
  <a href="https://github.com/Kuingsmile/word-GPT-Plus">
    <img src="./public/logo.svg" alt="Logo" height="100">
  </a>

  <h2 align="center">Word GPT Plus - Enhanced Fork v2.0.1</h2>
  <p align="center">
    Word GPT Plus with additional AI provider integrations (Mistral AI & Open WebUI)
    <br />
    <a href="https://github.com/Kuingsmile/word-GPT-Plus">
      <img src="https://img.shields.io/badge/Based%20On-Kuingsmile%2Fword--GPT--Plus-blue?style=flat-square" alt="original repo" />
    </a>
    <img src="https://img.shields.io/badge/Version-2.0.1-green?style=flat-square" alt="version" />
  </p>
</div>

## 🙏 About This Fork

A fork of the excellent [Word GPT Plus](https://github.com/Kuingsmile/word-GPT-Plus) by [Kuingsmile](https://github.com/Kuingsmile), with added support for:

- **Mistral AI** - Native API integration (no CORS issues) with full Agent mode support
- **Open WebUI** - Multi-backend AI gateway with dynamic model discovery

See [PLUGIN_PROVIDERS.md](./PLUGIN_PROVIDERS.md) for detailed configuration.

---

## 🆕 What's New in v2.0.1

- ✅ **Fixed Settings Persistence** - All settings now save correctly
- ✅ **OpenWebUI Model Display** - Models appear correctly on HomePage dropdown
- ✅ **OpenWebUI API URL Fix** - Corrected endpoint path construction
- ✅ **Agent Mode Fallback** - OpenWebUI gracefully falls back to chat mode
- ✅ **Improved Architecture** - Uses flat localStorage pattern for reliability

---

## 🚀 Quick Start

### 1. Build from Source

```bash
git clone <your-fork-url>
cd word-GPT-Plus
npm install
npm run build
```

### 2. Install in Word

**Option A - Quick Upload:**
1. Open Word → **Insert** → **Get Add-ins** → **Upload My Add-in**
2. Select: `release/instant-use/manifest.xml`

**Option B - Self-Hosted:**
1. Copy manifest: `release/self-hosted/manifest.xml`
2. Edit manifest: Replace `http://localhost:3000` with your server URL
3. Upload to Word using the same process

See [README_org.md](./README_org.md#add-in-installation-guide) for detailed sideload instructions.

### 3. Configure Provider

Open Word GPT Plus → **Settings** tab → Select AI provider and enter API key:

| Provider | Where to Get API Key | Agent Mode |
|----------|---------------------|------------|
| Mistral AI | https://console.mistral.ai | ✅ Full support |
| Open WebUI | Your Open WebUI instance → Settings → API Keys | ⚠️ Chat only |
| OpenAI | https://platform.openai.com/account/api-keys | ✅ Full support |
| Azure OpenAI | https://portal.azure.com | ✅ Full support |
| Google Gemini | https://ai.google.dev | ✅ Full support |
| Groq | https://console.groq.com/keys | ✅ Full support |
| Ollama | Local instance (no key needed) | ✅ Full support |

---

## 🌐 OpenWebUI Configuration

> **Important**: OpenWebUI requires specific Base URL configuration for reverse proxy setups.

### Base URL Format

| Deployment | Base URL |
|------------|----------|
| Direct (same port) | `http://localhost:8080` |
| **Nginx Reverse Proxy** | `http://localhost:3100/openwebui-api` |
| Remote with Proxy | `https://your-domain.com/openwebui-api` |

### Why `/openwebui-api`?

When Word-GPT-Plus runs on port 3100 and Open WebUI on port 8080, you need a reverse proxy to avoid CORS issues. The plugin appends `/api/v1` automatically:

```
Your Input:    http://localhost:3100/openwebui-api
Final URL:     http://localhost:3100/openwebui-api/api/v1/chat/completions
```

See [PLUGIN_PROVIDERS.md](./PLUGIN_PROVIDERS.md#open-webui-setup) for Nginx configuration examples.

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Copy and customize the template
cp docker-compose.template.yml docker-compose.yml

# Start the service
docker-compose up -d

# Access at http://localhost:3100
```

The template includes:
- Production-ready Node.js + Nginx setup
- Resource limits and health checks
- OpenWebUI reverse proxy configuration
- Comprehensive configuration comments

See [docker-compose.template.yml](./docker-compose.template.yml) for all options.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README_org.md](./README_org.md) | Complete original documentation - features, usage, all AI providers |
| [README_cn.md](./README_cn.md) | 简体中文版本 |
| [PLUGIN_PROVIDERS.md](./PLUGIN_PROVIDERS.md) | **v2.0.1** - Mistral AI & Open WebUI configuration, architecture |
| [CONTRIBUTING_FORK.md](./CONTRIBUTING_FORK.md) | Development setup, building from source, contributing |
| [docs/openwebui_tool_integration.md](./docs/openwebui_tool_integration.md) | Future: Full OpenWebUI tool integration guide |

---

## 🔧 Development

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Linting
npm run lint
npm run lint:fix
```

---

## 📜 License

MIT License - Same as original [Word GPT Plus](https://github.com/Kuingsmile/word-GPT-Plus)

---

**Updated**: January 2026 | **Version**: 2.0.1
