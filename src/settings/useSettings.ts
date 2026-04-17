import { onScopeDispose, type Ref, ref, watch } from 'vue'

import { Settings } from './schema'
import { SettingsStorage } from './storage'

let settingsInstance: Ref<Settings> | null = null
let saveTimeout: NodeJS.Timeout | null = null
let stopWatcher: (() => void) | null = null

export function useSettings() {
  if (!settingsInstance) {
    try {
      // Try to migrate from legacy settings first
      const migrated = SettingsStorage.migrateFromLegacy()

      // Load from storage (this will use migrated settings if they were saved)
      const stored = SettingsStorage.load()

      // Merge migrated settings with stored settings (stored takes precedence)
      const initialSettings = { ...migrated, ...stored }

      settingsInstance = ref(initialSettings)

      // Auto-save on changes with debounce to prevent excessive saves
      stopWatcher = watch(
        settingsInstance,
        newSettings => {
          if (saveTimeout) clearTimeout(saveTimeout)
          saveTimeout = setTimeout(() => {
            SettingsStorage.save(newSettings)
          }, 500)
        },
        { deep: true },
      )

      // Cleanup function for memory leak prevention
      onScopeDispose(() => {
        if (saveTimeout) {
          clearTimeout(saveTimeout)
          saveTimeout = null
        }
        if (stopWatcher) {
          stopWatcher()
          stopWatcher = null
        }
      })
    } catch {
      settingsInstance = ref(SettingsStorage.load())
    }
  }

  if (!settingsInstance) {
    throw new Error('Settings failed to initialize')
  }

  return settingsInstance
}

// Helper function to get settings without reactivity
export function getCurrentSettings(): Settings {
  if (!settingsInstance) {
    return SettingsStorage.load()
  }
  return settingsInstance.value
}
