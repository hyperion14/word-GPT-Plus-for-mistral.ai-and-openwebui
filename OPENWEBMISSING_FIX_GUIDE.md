# 🚨 OpenWebUI Provider Display Fix Guide

## Problem Description

When selecting OpenWebUI as the LLM provider in the settings, the OpenAI settings card remains visible instead of showing the OpenWebUI configuration section. Users cannot see the Base URL, JWT Token fields, or the refresh button for OpenWebUI models.

## Root Cause Analysis

After extensive investigation, the issue appears to be in the template rendering logic where the OpenWebUI settings section is not being displayed when selected.

## Step-by-Step Fix Instructions

### 1. Add Debug Logging (Diagnostic Step)

First, add console logging to understand what's happening:

```vue
<!-- In src/pages/SettingsPage.vue, around line 82 -->
<div
  v-for="platform in Object.keys(availableAPIs)"
  v-show="settingForm.api === platform"
  :key="platform"
  class="api-config-section"
>
  <!-- Add this debug line temporarily -->
  <div v-if="platform === 'openwebui'" style="display: none;">
    Debug: OpenWebUI section, current API: {{ settingForm.api }}, platform: {{ platform }}, match: {{ settingForm.api === platform }}
  </div>
  <!-- Rest of the template... -->
</div>
```

### 2. Verify Dropdown Selection

Add visual feedback for the current API selection:

```vue
<!-- Add this below the API provider dropdown -->
<div style="font-size: 12px; color: #666; margin-top: 4px;">
  Current API: {{ settingForm.api }}
  <span v-if="settingForm.api === 'openwebui'" style="color: green;">✓ OpenWebUI selected</span>
  <span v-else style="color: orange;">⚠ Not OpenWebUI</span>
</div>
```

### 3. Force Display OpenWebUI Section (Temporary Test)

Modify the template to force-show the OpenWebUI section for testing:

```vue
<!-- Replace the v-show condition temporarily -->
<div
  v-for="platform in Object.keys(availableAPIs)"
  v-show="settingForm.api === platform || platform === 'openwebui'"
  :key="platform"
  class="api-config-section"
>
```

### 4. Add Manual Override Button

Add a button to manually set the API to OpenWebUI:

```vue
<!-- Add this button near the API dropdown -->
<button
  @click="() => {
    settingForm.api = 'openwebui';
    console.log('Manually set API to openwebui', settingForm.api);
    setTimeout(() => refreshOpenWebUIModels(), 100);
  }"
  style="margin-left: 8px; padding: 4px 8px; font-size: 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px;"
  title="Force OpenWebUI display for testing"
>
  Force OpenWebUI
</button>
```

### 5. Check Template Rendering Logic

Ensure the OpenWebUI settings are properly included in the template loops:

```vue
<!-- Verify these functions return OpenWebUI settings -->
<div v-for="item in getApiInputSettings(platform)" :key="item">
  <!-- Should include openwebuiBaseURL and openwebuiAPIKey when platform === 'openwebui' -->
</div>

<div v-for="item in getApiSelectSettings(platform)" :key="item">
  <!-- Should include openwebuiModelSelect when platform === 'openwebui' -->
</div>

<div v-for="item in getApiNumSettings(platform)" :key="item">
  <!-- Should include openwebuiTemperature and openwebuiMaxTokens when platform === 'openwebui' -->
</div>
```

### 6. Verify Setting Preset Configuration

Ensure all OpenWebUI settings are properly defined in `src/utils/settingPreset.ts`:

```typescript
// Should include these settings:
openwebuiBaseURL: inputSetting('', 'openwebuiBaseURL'),
openwebuiAPIKey: inputSetting('', 'openwebuiAPIKey'),
openwebuiTemperature: inputNumSetting(0.7, 'openwebuiTemperature', 'temperature'),
openwebuiMaxTokens: inputNumSetting(1024, 'openwebuiMaxTokens', 'maxTokens'),
openwebuiModelSelect: selectSetting('llama3.1:latest', 'openwebuiModel', availableModelsForOpenWebUI),
```

### 7. Check API Provider List

Verify OpenWebUI is included in the available APIs:

```typescript
// In src/utils/constant.ts
export const availableAPIs: IStringKeyMap = {
  official: 'official',
  azure: 'azure',
  gemini: 'gemini',
  ollama: 'ollama',
  groq: 'groq',
  mistral: 'mistral',
  openwebui: 'openwebui',  // ✅ Must be present
}
```

### 8. Verify API Display Names

Ensure OpenWebUI has a proper display name:

```typescript
export const apiDisplayNames: Record<string, string> = {
  // ... other providers
  openwebui: 'Open WebUI',  // ✅ Must be present
}
```

## Debugging Checklist

### Browser Console Checks

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Select OpenWebUI from the dropdown
4. Check for:
   - Vue warnings about undefined properties
   - JavaScript errors
   - Console.log output from debug statements
   - Network requests to fetch models

### Network Tab Checks

1. Go to the Network tab
2. Select OpenWebUI
3. Click the refresh button
4. Check for:
   - Request to `/api/v1/models` endpoint
   - Proper Authorization header with JWT token
   - Successful response with model list

### Expected Behavior After Fix

1. ✅ OpenWebUI appears in the API provider dropdown
2. ✅ Selecting OpenWebUI updates the UI to show OpenWebUI settings
3. ✅ Base URL and JWT Token input fields are visible
4. ✅ Model selection dropdown shows "Click refresh to fetch models"
5. ✅ Refresh button is visible and clickable
6. ✅ Success/error messages appear when fetching models
7. ✅ Fetched models populate the model selection dropdown

## Common Issues and Solutions

### Issue: OpenWebUI not in dropdown
**Solution**: Ensure `availableAPIs` includes `openwebui: 'openwebui'`

### Issue: Section not showing when selected
**Solution**: Check `v-show="settingForm.api === platform"` condition and debug logging

### Issue: Settings fields missing
**Solution**: Verify `getApiInputSettings('openwebui')` returns the expected fields

### Issue: Refresh button not working
**Solution**: Check `refreshOpenWebUIModels()` function and network requests

### Issue: Models not fetching
**Solution**: Verify Base URL and JWT Token are properly configured

## Final Verification

After implementing the fixes:

1. Clear browser cache and localStorage
2. Restart the application
3. Select OpenWebUI from the dropdown
4. Verify all settings fields appear
5. Enter valid Base URL and JWT Token
6. Click refresh button
7. Verify models are fetched and displayed
8. Select a model and save settings
9. Test chat functionality with OpenWebUI provider

## Rollback Plan

If issues persist after changes:

1. Revert template changes
2. Check git history for recent changes
3. Restore from last known working version
4. Implement changes incrementally with testing between steps

---

**Note**: This guide provides systematic debugging steps to identify and resolve the OpenWebUI provider display issue. The actual fix may require a combination of these approaches based on the specific root cause identified through debugging.