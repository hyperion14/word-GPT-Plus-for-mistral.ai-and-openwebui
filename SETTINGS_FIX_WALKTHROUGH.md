# Word-GPT-Plus Settings Fix - Walkthrough

## Changes Made

### 1. Fixed Settings Adapter (`src/composables/useSettingsAdapter.ts`)

#### Problem
The `ollama.maxTokens` field was missing from the settings adapter, causing incomplete settings to be saved. This violated the Zod schema validation and could cause settings to be rejected.

#### Solution
Added `ollamaMaxTokens` to three locations:

1. **FlatSettings Interface** (line 44):
   ```typescript
   ollamaMaxTokens: number
   ```

2. **Getter** (line 107):
   ```typescript
   ollamaMaxTokens: settings.value.ollama.maxTokens,
   ```

3. **Setter** (line 172):
   ```typescript
   maxTokens: flatSettings.ollamaMaxTokens,
   ```

### 2. Added OpenWebUI Model Support to HomePage (`src/pages/HomePage.vue`)

#### Problem
OpenWebUI was selectable as a provider on HomePage, but the model dropdown remained empty because there was no case to load OpenWebUI models.

#### Solution
Added `openwebui` case to `currentModelOptions` computed property (lines 378-388):

```typescript
case 'openwebui':
  // Load dynamically fetched models from localStorage
  const stored = localStorage.getItem('openwebuiDynamicModels')
  if (stored) {
    try {
      presetOptions = JSON.parse(stored)
    } catch {
      presetOptions = []
    }
  }
  customModels = getCustomModels('openwebuiCustomModels', 'openwebuiCustomModel')
  break
```

This matches the pattern used in SettingsPage and loads:
- Dynamically fetched models from `openwebuiDynamicModels` localStorage key
- Custom models added by the user

## Testing Results

### Build Status
✅ **Build successful** - No compilation errors
- Build time: 13.54s
- All TypeScript checks passed
- Vite production build completed

### Expected Behavior After Fix

#### Settings Persistence
1. **All Providers**: Settings should now persist correctly across page reloads
2. **Ollama**: Temperature, endpoint, model, AND maxTokens all saved
3. **Mistral**: API key, baseURL, model, temperature, maxTokens all saved
4. **OpenWebUI**: JWT token, baseURL, model, temperature, maxTokens all saved

#### HomePage Model Selection
1. **Mistral**: Dropdown shows Mistral models (mistral-large-latest, etc.)
2. **OpenWebUI**: Dropdown shows models fetched from OpenWebUI API (after clicking refresh in Settings)
3. **All Providers**: Selected model is remembered after page refresh

## Verification Steps

### Test 1: Settings Persistence
1. Open Settings → API Provider
2. Select "Mistral"
3. Configure: API Key, Model, Temperature, Max Tokens
4. Go back to HomePage
5. Refresh browser/reload plugin
6. Return to Settings
7. **Expected**: All Mistral settings should be preserved

### Test 2: OpenWebUI Models on HomePage
1. In Settings, select "OpenWebUI"
2. Enter Base URL and JWT Token
3. Click refresh button to fetch models
4. Go to HomePage
5. Select "OpenWebUI" from provider dropdown
6. **Expected**: Model dropdown shows the fetched models

### Test 3: Model Selection Persistence
1. On HomePage, select "Mistral" and choose a model
2. Refresh the plugin
3. **Expected**: Mistral provider and selected model should still be active

## Files Modified

1. `src/composables/useSettingsAdapter.ts`
   - Added `ollamaMaxTokens` to FlatSettings interface
   - Added `ollamaMaxTokens` to getter
   - Added `maxTokens` to ollama setter

2. `src/pages/HomePage.vue`
   - Added `openwebui` case to `currentModelOptions` computed property

## Next Steps

To deploy these changes:

```bash
# Already completed - build was successful
npm run build

# If using Docker, rebuild the container
docker-compose build
docker-compose up -d
```

## Notes

- The default OpenWebUI baseURL is `http://localhost:3100/openwebui-api` (defined in schema.ts)
- OpenWebUI models are fetched dynamically via the refresh button in Settings
- Models are stored in localStorage under the key `openwebuiDynamicModels`
- The settings system uses Zod schema validation - all fields must match the schema
