/**
 * Settings Form - Provides a reactive settings object initialized from localStorage
 */

import { Ref, ref } from 'vue'

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
      settings[key] = preset.getFunc()
    } else {
      const storageKey = preset.saveKey || key
      const storedValue = localStorage.getItem(storageKey)
      settings[key] = storedValue ?? preset.defaultValue
    }
  }

  return settings
}

/**
 * Returns a reactive ref containing all settings, initialized from localStorage
 */
function useSettingForm() {
  return ref(initializeSettings()) as Ref<SettingForm>
}

export default useSettingForm
