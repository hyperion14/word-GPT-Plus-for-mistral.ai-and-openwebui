# OpenWebUI Tool Integration Guide

> **Advanced Feature**: This guide explains how to integrate Word-GPT-Plus tools with OpenWebUI's native tool system for full agent mode support.

## Overview

OpenWebUI supports tool calling differently from OpenAI/LangChain:

| Aspect | OpenAI/LangChain | OpenWebUI |
|--------|-----------------|-----------|
| Tool Definitions | Sent with each request | Registered server-side |
| Client sends | Full tool schemas | Only `tool_ids` |
| Tool execution | Client-side | Server-side (Python) |

## Current Status

**Word-GPT-Plus 2.0.1** uses OpenWebUI in **Chat Mode Only** because:
- Our tools are designed for LangChain's client-side execution model
- OpenWebUI expects tools to be Python scripts on the server
- Converting all client-side tools would require significant refactoring

## Future Integration Options

### Option 1: Create OpenWebUI Functions

Register Word-GPT-Plus tools as OpenWebUI Python functions:

```python
# Example: word_insert_text.py (to be placed in OpenWebUI's functions directory)
"""
title: Word Insert Text
author: Word-GPT-Plus
version: 0.1.0
description: Insert text into Microsoft Word document
"""

class Tools:
    def __init__(self):
        pass

    def insert_text(self, text: str, position: str = "cursor") -> str:
        """
        Insert text into the current Word document.
        
        :param text: The text to insert
        :param position: Where to insert ('cursor', 'start', 'end')
        :return: Success message
        """
        # Note: This requires a bridge to communicate with the Word Add-in
        # OpenWebUI runs server-side, Word runs client-side
        # This would need a WebSocket or API bridge
        return f"Text insertion queued: {text[:50]}..."
```

### Option 2: Use tool_ids in API Calls

If you have tools configured in OpenWebUI, the plugin could send:

```typescript
// Modified API call with tool_ids
const response = await fetch(`${baseURL}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama3.1:latest',
    messages: [...],
    tool_ids: ['web_search', 'calculator'] // Reference to server-side tools
  })
})
```

### Option 3: Hybrid Approach (Recommended for Future)

1. **Server-side tools** for general capabilities (web search, file operations)
2. **Client-side execution** via WebSocket bridge for Word-specific operations
3. **Tool results** sent back to OpenWebUI for context

## Architecture for Full Integration

```
┌─────────────────────────────────────────────────────────────┐
│  Word Add-in (Client)                                        │
│  ├── WebSocket Client                                        │
│  └── Word API Access                                         │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket
┌─────────────────────────────────────────────────────────────┐
│  Bridge Server (New Component)                               │
│  ├── Receives tool execution requests from OpenWebUI         │
│  ├── Forwards to Word Add-in via WebSocket                   │
│  └── Returns results to OpenWebUI                            │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/API
┌─────────────────────────────────────────────────────────────┐
│  OpenWebUI                                                   │
│  ├── Native Tool System                                      │
│  ├── Word-GPT-Plus Tool Functions (Python)                   │
│  └── Chat Completions with tool_ids                          │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps (Future Work)

### Step 1: Create Bridge Server

```python
# bridge_server.py
from fastapi import FastAPI, WebSocket
from typing import Dict, List
import asyncio

app = FastAPI()
connected_clients: Dict[str, WebSocket] = {}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    connected_clients[client_id] = websocket
    try:
        while True:
            data = await websocket.receive_text()
            # Handle responses from Word Add-in
    except:
        del connected_clients[client_id]

@app.post("/execute-tool")
async def execute_tool(tool_name: str, params: dict):
    # Called by OpenWebUI tool function
    # Forward to Word Add-in
    for ws in connected_clients.values():
        await ws.send_json({
            "action": tool_name,
            "params": params
        })
    # Wait for response (simplified)
    return {"status": "executed"}
```

### Step 2: Create OpenWebUI Tool Functions

Place in OpenWebUI's `functions` directory:

```python
# word_tools.py
import aiohttp

class Tools:
    def __init__(self):
        self.bridge_url = "http://localhost:8765"

    async def word_insert_text(self, text: str) -> str:
        """
        Insert text into Word document.
        :param text: Text to insert
        :return: Result message
        """
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.bridge_url}/execute-tool",
                json={"tool": "insert_text", "text": text}
            ) as resp:
                return await resp.text()
```

### Step 3: Update Word Add-in

Add WebSocket client to connect to bridge:

```typescript
// In Word Add-in
const ws = new WebSocket('ws://localhost:8765/ws/word-addin')

ws.onmessage = async (event) => {
  const { action, params } = JSON.parse(event.data)
  
  switch (action) {
    case 'insert_text':
      await Word.run(async (context) => {
        context.document.body.insertText(params.text, 'End')
        await context.sync()
      })
      ws.send(JSON.stringify({ status: 'success' }))
      break
  }
}
```

## Current Workaround

Until full integration is implemented, Word-GPT-Plus 2.0.1 uses **Chat Mode** for OpenWebUI:

- ✅ Full chat functionality works
- ✅ Streaming responses
- ✅ Model selection
- ❌ Agent mode with tools (falls back to chat)

When agent mode is selected with OpenWebUI, the plugin shows a warning and uses normal chat instead.

## Testing OpenWebUI Tools

To test if your OpenWebUI has tools configured:

1. Open OpenWebUI web interface
2. Go to **Workspace → Tools**
3. Check if any tools are listed
4. Try them in a chat to verify they work

## References

- [OpenWebUI Tools Documentation](https://docs.openwebui.com/features/plugin/tools/)
- [OpenWebUI Functions Documentation](https://docs.openwebui.com/features/plugin/functions/)
- [OpenWebUI API Reference](https://docs.openwebui.com/api/)
