/**
 * Settings Form - Provides a reactive settings object initialized from localStorage
 * This is the same pattern as the original plugin that actually works with v-model
 */

import { Ref, ref } from 'vue'

import { localStorageKey } from './enum'
import { Setting_Names, SettingNames, settingPreset } from './settingPreset'

type SettingForm = {
  [K in SettingNames]: (typeof settingPreset)[K]['defaultValue']
}

type SettingValue = string | number | string[]

function initializeSettings(): Record<string, SettingValue> {
  const settings: Record<string, SettingValue> = {}

  for (const key of Setting_Names) {
    const preset = settingPreset[key]

    if (preset.getFunc) {
      // Use the preset's getter function (e.g., for parsing numbers or custom models)
      settings[key] = preset.getFunc()
    } else {
      // Otherwise load from localStorage with saveKey or key
      const storageKey = preset.saveKey || key
      const storedValue = localStorage.getItem(storageKey)
      settings[key] = storedValue ?? preset.defaultValue
    }
  }

  // Special case for legacy support
  if (settings.api === 'palm') {
    settings.api = 'gemini'
    localStorage.setItem(localStorageKey.api, 'gemini')
  }

  console.log('🔧 [settingForm] Settings initialized from localStorage:', settings)
  return settings
}

/**
 * Returns a reactive ref containing all settings, initialized from localStorage
 * This is a PLAIN REF, not a computed ref, so v-model works correctly
 */
function useSettingForm() {
  return ref(initializeSettings()) as Ref<SettingForm>
}

export default useSettingForm
