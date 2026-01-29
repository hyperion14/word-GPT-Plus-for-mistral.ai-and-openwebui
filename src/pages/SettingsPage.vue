<template>
  <div class="settings-container">
    <!-- Header with back button -->
    <div class="settings-header">
      <button class="back-button" :title="$t('back')" @click="backToHome">
        <ArrowLeft :size="20" />
      </button>
      <h2 class="header-title">
        {{ $t('settings') || 'Settings' }}
      </h2>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :title="$t(tab.label) || tab.defaultLabel"
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        <component :is="tab.icon" :size="16" />
      </button>
    </div>

    <!-- Main Content -->
    <div class="settings-main">
      <div class="content-body">
        <!-- General Settings -->
        <div v-show="currentTab === 'general'" class="settings-section">
          <div class="setting-card">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ $t('localLanguageLabel') }}</label>
              </div>
              <div class="setting-control">
                <select v-model="settingForm.localLanguage" class="select-input">
                  <option v-for="item in settingPreset.localLanguage.optionObj" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="setting-divider" />

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ $t('replyLanguageLabel') }}</label>
              </div>
              <div class="setting-control">
                <select v-model="settingForm.replyLanguage" class="select-input">
                  <option v-for="item in settingPreset.replyLanguage.optionObj" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- API Provider Settings -->
        <div v-show="currentTab === 'provider'" class="settings-section">
          <div class="setting-card">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ $t('providerLabel') }}</label>
              </div>
              <div style="width: 100%">
                <select 
                  v-model="selectedProvider"
                  class="select-input"
                >
                  <option v-for="item in settingPreset.api.optionObj" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Dynamic API Configuration -->
          <div
            v-for="platform in Object.keys(availableAPIs)"
            v-show="selectedProvider === platform"
            :key="platform"
            class="api-config-section"
          >
            <h3 class="subsection-title">
              {{ apiDisplayNames[platform] || platform }}
              {{ $t('configuration') }}
            </h3>

            <div class="setting-card">
              <!-- Special: OpenWebUI URL Inputs (user-friendly) -->
              <div v-if="platform === 'openwebui'">
                <!-- OpenWebUI URL -->
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{ $t('openwebuiURLLabel') }}</label>
                    <small class="setting-hint">
                      {{ $t('openwebuiURLPlaceholder') }}
                    </small>
                  </div>
                  <div class="setting-control full-width">
                    <input
                      v-model="settingForm.openwebuiURL"
                      class="text-input"
                      type="text"
                      :placeholder="$t('openwebuiURLPlaceholder')"
                    />
                  </div>
                </div>
                <div class="setting-divider" />

                <!-- Plugin URL -->
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{ $t('openwebuiPluginURLLabel') }}</label>
                    <small class="setting-hint">
                      {{ $t('openwebuiPluginURLPlaceholder') }}
                    </small>
                  </div>
                  <div class="setting-control full-width">
                    <input
                      v-model="settingForm.openwebuiPluginURL"
                      class="text-input"
                      type="text"
                      :placeholder="$t('openwebuiPluginURLPlaceholder')"
                    />
                  </div>
                </div>
                <div class="setting-divider" />

                <!-- Computed Base URL (read-only display) -->
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{ $t('openwebuiBaseURLLabel') }}</label>
                    <small class="setting-hint">
                      {{ $t('openwebuiBaseURLPlaceholder') }}
                    </small>
                  </div>
                  <div class="setting-control full-width">
                    <input
                      v-model="settingForm.openwebuiBaseURL"
                      class="text-input"
                      type="text"
                      :placeholder="$t('openwebuiBaseURLPlaceholder')"
                      disabled
                      style="background-color: #f6f8fa; cursor: not-allowed;"
                    />
                  </div>
                </div>
                <div class="setting-divider" />
              </div>

              <!-- Input Settings -->
              <div v-for="(item, index) in getApiInputSettings(platform)" :key="item">
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{ $t(getLabel(item)) }}</label>
                    <!-- Hint for JWT Token - shows the OpenWebUI URL -->
                    <small v-if="platform === 'openwebui' && item === 'openwebuiAPIKey'" class="setting-hint">
                      <span v-if="settingForm.openwebuiURL">
                        Get JWT token from: {{ settingForm.openwebuiURL }}
                      </span>
                      <span v-else>
                        Get JWT token from your Open-WebUI instance (enter URL above)
                      </span>
                    </small>
                  </div>
                  <div class="setting-control full-width">
                    <input
                      v-model="settingForm[item as SettingNames]"
                      class="text-input"
                      :type="item.includes('APIKey') || item.includes('apiKey') ? 'password' : 'text'"
                      :placeholder="$t(getPlaceholder(item))"
                    />
                  </div>
                </div>
                <div v-if="index < getApiInputSettings(platform).length - 1" class="setting-divider" />
              </div>

              <!-- Custom Models Management -->
              <div v-if="hasCustomModelsSupport(platform)">
                <div v-if="getApiInputSettings(platform).length > 0" class="setting-divider" />
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{ $t('customModelsLabel') }}</label>
                  </div>
                  <div class="setting-control left-gap">
                    <div style="display: flex; gap: 8px; margin-bottom: 8px">
                      <input
                        v-model="newCustomModel[platform]"
                        class="text-input"
                        type="text"
                        :placeholder="$t('customModelPlaceholder')"
                        @keyup.enter="addCustomModel(platform)"
                      />
                      <button class="add-button" style="white-space: nowrap" @click="addCustomModel(platform)">
                        <component :is="Plus" :size="16" />
                      </button>
                    </div>
                    <div
                      v-if="customModelsMap[platform] && customModelsMap[platform].length > 0"
                      style="display: flex; flex-wrap: wrap; gap: 6px"
                    >
                      <span v-for="model in customModelsMap[platform]" :key="model" class="custom-model-tag">
                        {{ model }}
                        <button class="remove-tag-btn" @click="removeCustomModel(platform, model)">
                          <component :is="X" :size="12" />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Select Settings -->
              <div v-for="item in getApiSelectSettings(platform)" :key="item">
                <div
                  v-if="getApiInputSettings(platform).length > 0 || hasCustomModelsSupport(platform)"
                  class="setting-divider"
                />
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{ $t(getLabel(item)) }}</label>
                  </div>
                  <div style="width: 100%; display: flex; gap: 8px; align-items: center">
                    <select v-model="settingForm[item as SettingNames]" class="select-input" style="flex: 1">
                      <option v-if="platform === 'openwebui' && getMergedModelOptions(platform).length === 0" value="">
                        Click refresh to fetch models (requires Base URL and JWT Token)
                      </option>
                      <option v-for="option in getMergedModelOptions(platform)" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                    <!-- Refresh Models Button for OpenWebUI -->
                    <button
                      v-if="platform === 'openwebui'"
                      class="icon-button"
                      :class="{ 'is-loading': isFetchingModels }"
                      :disabled="isFetchingModels"
                      :title="
                        isFetchingModels
                          ? 'Fetching models...'
                          : 'Refresh models from Open WebUI (requires valid JWT Token and Base URL)'
                      "
                      @click="refreshOpenWebUIModels"
                    >
                      <RefreshCw :size="16" :class="{ spin: isFetchingModels }" />
                    </button>
                  </div>
                </div>
                <!-- Success message for OpenWebUI models fetch -->
                <div v-if="platform === 'openwebui' && modelsFetchSuccess" style="padding: 8px 0">
                  <span style="color: #10b981; font-size: 12px">✓ {{ modelsFetchSuccess }}</span>
                </div>
                <!-- Error message for OpenWebUI models fetch -->
                <div v-if="platform === 'openwebui' && modelsFetchError" style="padding: 8px 0">
                  <span style="color: #ef4444; font-size: 12px">{{ modelsFetchError }}</span>
                </div>
                <!-- Info message for OpenWebUI JWT Token requirement -->
                <div v-if="platform === 'openwebui' && item.includes('ModelSelect')" style="padding: 8px 0">
                  <span style="color: #656d76; font-size: 11px; line-height: 1.4">
                    ℹ️ Note: Open WebUI requires a JWT Token (not an API Key). Get it from your browser's DevTools >
                    Application > Local Storage > token after logging into Open WebUI.
                  </span>
                </div>
              </div>

              <!-- Number Settings -->
              <div v-for="item in getApiNumSettings(platform)" :key="item">
                <div class="setting-divider" />
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{ $t(getLabel(item)) }}</label>
                  </div>
                  <div class="setting-control">
                    <input
                      v-model.number="settingForm[item as SettingNames]"
                      class="text-input number-input"
                      type="number"
                      :min="0"
                      :max="item.includes('Temperature') ? 2 : 32000"
                      :step="item.includes('Temperature') ? 0.1 : 1"
                      :placeholder="$t(getPlaceholder(item))"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Prompts Settings -->
        <div v-show="currentTab === 'prompts'" class="settings-section">
          <!-- Prompt List -->
          <div class="prompts-list">
            <div class="list-header">
              <h3 class="list-title">
                {{ $t('savedPrompts') }}
              </h3>
              <button class="add-button" @click="addNewPrompt">
                <component :is="Plus" :size="16" />
                <span>{{ $t('addPrompt') || 'Add' }}</span>
              </button>
            </div>

            <div v-for="prompt in savedPrompts" :key="prompt.id" class="prompt-item">
              <div class="prompt-header">
                <div class="prompt-title-row">
                  <input
                    v-if="editingPromptId === prompt.id"
                    v-model="editingPrompt.name"
                    class="prompt-name-input"
                    @blur="savePromptEdit"
                    @keyup.enter="savePromptEdit"
                  />
                  <span v-else class="prompt-name">{{ prompt.name }}</span>
                </div>
                <div class="prompt-actions">
                  <button class="icon-button" :title="$t('edit') || 'Edit'" @click="startEditPrompt(prompt)">
                    <component :is="Edit2" :size="14" />
                  </button>
                  <button
                    v-if="savedPrompts.length > 1"
                    class="icon-button delete"
                    :title="$t('delete') || 'Delete'"
                    @click="deletePrompt(prompt.id)"
                  >
                    <component :is="Trash2" :size="14" />
                  </button>
                </div>
              </div>

              <div v-if="editingPromptId === prompt.id" class="prompt-editor">
                <label class="editor-label">{{ $t('systemPrompt') }}</label>
                <textarea
                  v-model="editingPrompt.systemPrompt"
                  class="textarea-input"
                  rows="3"
                  :placeholder="$t('systemPromptPlaceholder')"
                />

                <label class="editor-label">{{ $t('userPrompt') }}</label>
                <textarea
                  v-model="editingPrompt.userPrompt"
                  class="textarea-input"
                  rows="3"
                  :placeholder="$t('userPromptPlaceholder')"
                />

                <div class="editor-actions">
                  <button class="save-button" @click="savePromptEdit">
                    {{ $t('save') || 'Save' }}
                  </button>
                  <button class="cancel-button" @click="cancelEdit">
                    {{ $t('cancel') || 'Cancel' }}
                  </button>
                </div>
              </div>

              <div v-else class="prompt-preview">
                <p class="preview-text">
                  {{ prompt.systemPrompt.substring(0, 100) }}{{ prompt.systemPrompt.length > 100 ? '...' : '' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tools Settings -->
        <div v-show="currentTab === 'tools'" class="settings-section">
          <!-- Word Tools Section -->
          <div class="setting-card" style="margin-top: 16px">
            <div class="list-header">
              <h3 class="list-title">
                {{ $t('wordTools') }}
              </h3>
            </div>
            <p class="section-description">
              {{ $t('wordToolsDescription') }}
            </p>

            <div class="word-tools-list compact">
              <div v-for="tool in wordToolsList" :key="tool.name" class="word-tool-item compact">
                <input
                  :id="'tool-' + tool.name"
                  type="checkbox"
                  :checked="isToolEnabled(tool.name, !isGeneralTool(tool.name))"
                  class="tool-checkbox"
                  @change="toggleTool(tool.name, !isGeneralTool(tool.name))"
                />
                <component :is="Wrench" :size="14" class="tool-icon-inline" />
                <div class="tool-info-compact" @click="toggleTool(tool.name, !isGeneralTool(tool.name))">
                  <label :for="'tool-' + tool.name" class="tool-name-compact">{{ $t(`wordTool_${tool.name}`) }}</label>
                  <span class="tool-description-compact">
                    {{ $t(`wordTool_${tool.name}_desc`) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Built-in Prompts Settings -->
        <div v-show="currentTab === 'builtinPrompts'" class="settings-section">
          <div class="setting-card" style="margin-top: 16px">
            <div class="list-header">
              <h3 class="list-title">
                {{ $t('builtinPrompts') || 'Built-in Prompts' }}
              </h3>
            </div>
            <p class="section-description">
              {{
                $t('builtinPromptsDescription', {
                  language: '${language}',
                  text: '${text}',
                }) ||
                'Customize the system and user prompts for built-in tools like Translate, Polish, Academic, Summary, and Grammar.'
              }}
            </p>

            <div v-for="(promptConfig, key) in builtInPromptsData" :key="key" class="builtin-prompt-item">
              <div class="prompt-header">
                <div class="prompt-title-row">
                  <span class="builtin-prompt-name">{{ $t(key) || key }}</span>
                </div>
                <div class="prompt-actions">
                  <button
                    class="icon-button"
                    :title="editingBuiltinPromptKey === key ? $t('save') : $t('edit')"
                    @click="toggleEditBuiltinPrompt(key)"
                  >
                    <component :is="editingBuiltinPromptKey === key ? Plus : Edit2" :size="14" />
                  </button>
                  <button
                    v-if="isBuiltinPromptModified(key)"
                    class="icon-button"
                    :title="$t('reset') || 'Reset'"
                    @click="resetBuiltinPrompt(key)"
                  >
                    <component :is="X" :size="14" />
                  </button>
                </div>
              </div>

              <div v-if="editingBuiltinPromptKey === key" class="prompt-editor">
                <label class="editor-label">{{ $t('systemPrompt') }}</label>
                <textarea
                  v-model="editingBuiltinPrompt.system"
                  class="textarea-input"
                  rows="3"
                  :placeholder="$t('systemPromptPlaceholder')"
                />

                <label class="editor-label">{{ $t('userPrompt') }}</label>
                <textarea
                  v-model="editingBuiltinPrompt.user"
                  class="textarea-input"
                  rows="4"
                  :placeholder="$t('userPromptPlaceholder')"
                />
              </div>

              <div v-else class="prompt-preview">
                <p class="preview-label">{{ $t('systemPrompt') }}:</p>
                <p class="preview-text">
                  {{ getSystemPromptPreview(promptConfig.system) }}
                </p>
                <p class="preview-label">{{ $t('userPrompt') }}:</p>
                <p class="preview-text">
                  {{ getUserPromptPreview(promptConfig.user) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ArrowLeft,
  Cpu,
  Edit2,
  Globe,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Wrench,
  X,
} from 'lucide-vue-next'
import { onBeforeMount, ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'

import { fetchOpenWebUIModels, loadOpenWebUIModels, saveOpenWebUIModels } from '@/api/openwebui'
import useSettingForm from '@/utils/settingForm'
import { SettingsStorage } from '@/settings/storage'
import { getLabel, getPlaceholder } from '@/utils/common'
import { apiDisplayNames, availableAPIs, buildInPrompt } from '@/utils/constant'
import { getGeneralToolDefinitions } from '@/utils/generalTools'
import { Setting_Names, SettingNames, settingPreset } from '@/utils/settingPreset'
import { getWordToolDefinitions } from '@/utils/wordTools'
import { useOpenWebUIInstance, useOpenWebUIURLResolver } from '@/composables/useOpenWebUIInstance'

const router = useRouter()
const settingForm = useSettingForm()

// DEBUG: Log the current API value
console.log('🔍 [SettingsPage] settingForm.api =', settingForm.value.api)
console.log('🔍 [SettingsPage] settingForm.value =', settingForm.value)

// CRITICAL FIX: Use local ref for selected provider to ensure Vue reactivity
const selectedProvider = ref(settingForm.value.api)

// Sync local ref with settingForm
watch(selectedProvider, (newProvider) => {
  console.log('🔄 [SettingsPage] selectedProvider changed to:', newProvider)
  settingForm.value.api = newProvider
})

const currentTab = ref('provider')

// Setup Open-WebUI URL resolver (auto-computes base URL from user-friendly URLs)
useOpenWebUIURLResolver(
  toRef(settingForm.value, 'openwebuiURL'),
  toRef(settingForm.value, 'openwebuiPluginURL'),
  toRef(settingForm.value, 'openwebuiBaseURL'),
  (openwebuiURL, pluginURL, resolvedBaseURL) => {
    console.log(`🔄 [OpenWebUI] URLs changed:`)
    console.log(`  OpenWebUI URL: ${openwebuiURL}`)
    console.log(`  Plugin URL: ${pluginURL}`)
    console.log(`  Resolved Base URL: ${resolvedBaseURL}`)

    // Auto-refresh models when URLs change (if JWT token is present)
    if (resolvedBaseURL && settingForm.value.openwebuiAPIKey) {
      setTimeout(() => {
        refreshOpenWebUIModels()
      }, 500) // Delay to ensure URL is updated
    }
  }
)

// DEPRECATED: Keep old instance-based logic for backward compatibility (but inactive)
useOpenWebUIInstance(
  toRef(settingForm.value, 'openwebuiInstance'),
  toRef(settingForm.value, 'openwebuiBaseURL'),
  () => {
    // Inactive - URL resolver takes precedence
  }
)

// Watch for API provider changes to auto-fetch OpenWebUI models
watch(
  () => settingForm.value.api,
  newProvider => {
    if (newProvider === 'openwebui') {
      // Check if we have baseURL and JWT token configured
      const baseURL = settingForm.value.openwebuiBaseURL
      const apiKey = settingForm.value.openwebuiAPIKey

      if (baseURL && apiKey) {
        // Auto-fetch models when OpenWebUI is selected
        setTimeout(() => {
          refreshOpenWebUIModels()
        }, 100) // Small delay to ensure UI is ready
      }
    }
  },
)

// Watch for OpenWebUI configuration changes to auto-refresh models
watch(
  () => [settingForm.value.openwebuiBaseURL, settingForm.value.openwebuiAPIKey],
  ([newBaseURL, newApiKey]) => {
    if (settingForm.value.api === 'openwebui' && newBaseURL && newApiKey) {
      // Auto-refresh models when Base URL or JWT Token changes
      setTimeout(() => {
        refreshOpenWebUIModels()
      }, 500) // Small delay to debounce rapid changes
    }
  },
)

// CRITICAL FIX: Create individual watches for each setting property
// This is the pattern from the original plugin that actually works with v-model on object properties
// The computed ref approach doesn't trigger when individual properties change via v-model

const addWatch = () => {
  Setting_Names.forEach((key: SettingNames) => {
    watch(
      () => settingForm.value[key as keyof typeof settingForm.value],
      (newValue) => {
        const preset = settingPreset[key]
        if (preset && preset.saveFunc) {
          // Use the preset's save function if available
          (preset as any).saveFunc(newValue)
          console.log(`💾 [SettingsPage] Saved ${key} via saveFunc:`, newValue)
        } else if (preset && preset.saveKey) {
          // Otherwise save directly to localStorage with the save key
          localStorage.setItem(preset.saveKey, String(newValue))
          console.log(`💾 [SettingsPage] Saved ${key} to localStorage (key: ${preset.saveKey}):`, newValue)
        } else {
          // Fallback: save with the setting name as key
          localStorage.setItem(key, String(newValue))
          console.log(`💾 [SettingsPage] Saved ${key} to localStorage:`, newValue)
        }
      },
      { deep: true },
    )
  })
  console.log('✅ [SettingsPage] addWatch() initialized - individual watches for all settings created')
}

// CRITICAL: Call addWatch immediately to set up watches before any user interaction
addWatch()

// Word tools list - convert wordTools from Record to array
const wordToolsList = [...getGeneralToolDefinitions(), ...Object.values(getWordToolDefinitions())]

const newCustomModel = ref<Record<string, string>>({})
const customModelsMap = ref<Record<string, string[]>>({})

// OpenWebUI dynamic models
const openwebuiDynamicModels = ref<string[]>(loadOpenWebUIModels() || [])
const isFetchingModels = ref(false)
const modelsFetchError = ref<string | null>(null)
const modelsFetchSuccess = ref<string | null>(null)

// Prompt management
interface Prompt {
  id: string
  name: string
  systemPrompt: string
  userPrompt: string
}

const savedPrompts = ref<Prompt[]>([])
const editingPromptId = ref<string>('')
const editingPrompt = ref<Prompt>({
  id: '',
  name: '',
  systemPrompt: '',
  userPrompt: '',
})

// Built-in prompts management
interface BuiltinPromptConfig {
  system: (language: string) => string
  user: (text: string, language: string) => string
}

type BuiltinPromptKey = 'translate' | 'polish' | 'academic' | 'summary' | 'grammar'

const builtInPromptsData = ref<Record<BuiltinPromptKey, BuiltinPromptConfig>>({
  translate: { ...buildInPrompt.translate },
  polish: { ...buildInPrompt.polish },
  academic: { ...buildInPrompt.academic },
  summary: { ...buildInPrompt.summary },
  grammar: { ...buildInPrompt.grammar },
})

const editingBuiltinPromptKey = ref<BuiltinPromptKey | ''>('')
const editingBuiltinPrompt = ref<{
  system: string
  user: string
}>({
  system: '',
  user: '',
})

const originalBuiltInPrompts = { ...buildInPrompt }

// Tool enable/disable state
const enabledWordTools = ref<Set<string>>(new Set())
const enabledGeneralTools = ref<Set<string>>(new Set())

const tabs = [
  { id: 'general', label: 'general', defaultLabel: 'General', icon: Globe },
  {
    id: 'provider',
    label: 'apiProvider',
    defaultLabel: 'API Provider',
    icon: Cpu,
  },
  {
    id: 'prompts',
    label: 'prompts',
    defaultLabel: 'Prompts',
    icon: MessageSquare,
  },
  {
    id: 'builtinPrompts',
    label: 'builtinPrompts',
    defaultLabel: 'Built-in Prompts',
    icon: Settings,
  },
  {
    id: 'tools',
    label: 'tools',
    defaultLabel: 'Tools',
    icon: Wrench,
  },
]

const getApiInputSettings = (platform: string) => {
  // Get all keys from settingForm that start with the platform name
  const formKeys = Object.keys(settingForm.value).filter(key => key.startsWith(platform))

  // Filter for input type fields, excluding custom model fields and URL fields (shown separately)
  return formKeys.filter(
    key =>
      settingPreset[key as SettingNames] &&
      (settingPreset as any)[key as SettingNames]?.type === 'input' &&
      !key.endsWith('CustomModel') &&
      !key.endsWith('CustomModels') &&
      // Exclude OpenWebUI URL fields (shown in separate section above)
      key !== 'openwebuiURL' &&
      key !== 'openwebuiPluginURL' &&
      key !== 'openwebuiBaseURL',
  )
}

const getApiNumSettings = (platform: string) => {
  const formKeys = Object.keys(settingForm.value).filter(key => key.startsWith(platform))

  return formKeys.filter(
    key => settingPreset[key as SettingNames] && (settingPreset as any)[key as SettingNames]?.type === 'inputNum',
  )
}

const getApiSelectSettings = (platform: string) => {
  const formKeys = Object.keys(settingForm.value).filter(key => key.startsWith(platform))

  return formKeys.filter(
    key => settingPreset[key as SettingNames] && (settingPreset as any)[key as SettingNames]?.type === 'select',
  )
}

const getCustomModelsKey = (platform: string): SettingNames | null => {
  const key = `${platform}CustomModels` as SettingNames
  return settingPreset[key] ? key : null
}

const loadCustomModels = () => {
  const platforms = ['official', 'gemini', 'ollama', 'groq', 'mistral', 'openwebui']
  platforms.forEach(platform => {
    const key = getCustomModelsKey(platform)
    if (key && settingPreset[key].getFunc) {
      customModelsMap.value[platform] = settingPreset[key].getFunc() as string[]
    }
  })
}

const addCustomModel = (platform: string) => {
  const model = newCustomModel.value[platform]?.trim()
  if (!model) return

  const key = getCustomModelsKey(platform)
  if (!key) return

  if (!customModelsMap.value[platform]) {
    customModelsMap.value[platform] = []
  }

  if (!customModelsMap.value[platform].includes(model)) {
    customModelsMap.value[platform].push(model)
    ;(settingPreset[key] as any).saveFunc(customModelsMap.value[platform])
    newCustomModel.value[platform] = ''
  }
}

const removeCustomModel = (platform: string, model: string) => {
  const key = getCustomModelsKey(platform)
  if (!key) return

  customModelsMap.value[platform] = customModelsMap.value[platform].filter(m => m !== model)
  ;(settingPreset[key] as any).saveFunc(customModelsMap.value[platform])

  // If the removed model was selected, switch to first available
  const selectKey = `${platform}ModelSelect` as SettingNames
  if (settingForm.value[selectKey] === model) {
    const options = getMergedModelOptions(platform)
    if (options.length > 0) {
      ;(settingForm.value as any)[selectKey] = options[0]
    }
  }
}

const getMergedModelOptions = (platform: string) => {
  const selectKey = `${platform}ModelSelect` as SettingNames
  const customModels = customModelsMap.value[platform] || []

  // For OpenWebUI, ONLY use dynamically fetched models (no fallback to hardcoded list)
  if (platform === 'openwebui') {
    const dynamicModels = openwebuiDynamicModels.value || []
    return [...customModels, ...dynamicModels]
  }

  const presetOptions = (settingPreset[selectKey] as any)?.optionList || []
  return [...customModels, ...presetOptions]
}

const hasCustomModelsSupport = (platform: string) => {
  return getCustomModelsKey(platform) !== null
}

// Note: Auto-save is handled by useSettings() with 500ms debounce
// No need for individual watch handlers here

const loadPrompts = () => {
  const stored = localStorage.getItem('savedPrompts')
  if (stored) {
    try {
      savedPrompts.value = JSON.parse(stored)
      return
    } catch {
      localStorage.removeItem('savedPrompts')
    }
  }
  savedPrompts.value = [
    {
      id: 'default',
      name: 'Default',
      systemPrompt: settingForm.value.systemPrompt || '',
      userPrompt: settingForm.value.userPrompt || '',
    },
  ]
  savePromptsToStorage()
}

const savePromptsToStorage = () => {
  localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts.value))
}

const addNewPrompt = () => {
  const newPrompt: Prompt = {
    id: `prompt_${Date.now()}`,
    name: `Prompt ${savedPrompts.value.length + 1}`,
    systemPrompt: '',
    userPrompt: '',
  }
  savedPrompts.value.push(newPrompt)
  savePromptsToStorage()
  startEditPrompt(newPrompt)
}

const startEditPrompt = (prompt: Prompt) => {
  editingPromptId.value = prompt.id
  editingPrompt.value = { ...prompt }
}

const savePromptEdit = () => {
  const index = savedPrompts.value.findIndex(p => p.id === editingPromptId.value)
  if (index !== -1) {
    savedPrompts.value[index] = { ...editingPrompt.value }
    savePromptsToStorage()
  }
  editingPromptId.value = ''
}

const cancelEdit = () => {
  editingPromptId.value = ''
}

const deletePrompt = (id: string) => {
  if (savedPrompts.value.length <= 1) return

  const index = savedPrompts.value.findIndex(p => p.id === id)
  if (index !== -1) {
    savedPrompts.value.splice(index, 1)
    savePromptsToStorage()
  }
}

// Built-in prompts functions
const loadBuiltInPrompts = () => {
  const stored = localStorage.getItem('customBuiltInPrompts')
  if (stored) {
    try {
      const customPrompts = JSON.parse(stored)
      Object.keys(customPrompts).forEach(key => {
        const typedKey = key as BuiltinPromptKey
        if (builtInPromptsData.value[typedKey]) {
          builtInPromptsData.value[typedKey] = {
            system: (language: string) => customPrompts[key].system.replace('${language}', language),
            user: (text: string, language: string) =>
              customPrompts[key].user.replace('${text}', text).replace('${language}', language),
          }
        }
      })
    } catch (error) {
      console.error('Error loading custom built-in prompts:', error)
    }
  }
}

const saveBuiltInPrompts = () => {
  const customPrompts: Record<string, { system: string; user: string }> = {}
  Object.keys(builtInPromptsData.value).forEach(key => {
    const typedKey = key as BuiltinPromptKey
    customPrompts[key] = {
      system: builtInPromptsData.value[typedKey].system('${language}'),
      user: builtInPromptsData.value[typedKey].user('${text}', '${language}'),
    }
  })
  localStorage.setItem('customBuiltInPrompts', JSON.stringify(customPrompts))
}

const toggleEditBuiltinPrompt = (key: BuiltinPromptKey) => {
  if (editingBuiltinPromptKey.value === key) {
    builtInPromptsData.value[key] = {
      system: (language: string) => editingBuiltinPrompt.value.system.replace(/\$\{language\}/g, language),
      user: (text: string, language: string) =>
        editingBuiltinPrompt.value.user.replace(/\$\{text\}/g, text).replace(/\$\{language\}/g, language),
    }
    saveBuiltInPrompts()
    editingBuiltinPromptKey.value = ''
  } else {
    editingBuiltinPromptKey.value = key
    editingBuiltinPrompt.value = {
      system: builtInPromptsData.value[key].system('${language}'),
      user: builtInPromptsData.value[key].user('${text}', '${language}'),
    }
  }
}

const isBuiltinPromptModified = (key: BuiltinPromptKey): boolean => {
  const current = {
    system: builtInPromptsData.value[key].system('English'),
    user: builtInPromptsData.value[key].user('sample text', 'English'),
  }
  const original = {
    system: originalBuiltInPrompts[key].system('English'),
    user: originalBuiltInPrompts[key].user('sample text', 'English'),
  }
  return current.system !== original.system || current.user !== original.user
}

const resetBuiltinPrompt = (key: BuiltinPromptKey) => {
  builtInPromptsData.value[key] = { ...originalBuiltInPrompts[key] }
  saveBuiltInPrompts()
  if (editingBuiltinPromptKey.value === key) {
    editingBuiltinPromptKey.value = ''
  }
}

const getSystemPromptPreview = (systemFunc: (language: string) => string): string => {
  const full = systemFunc('English')
  return full.length > 100 ? full.substring(0, 100) + '...' : full
}

const getUserPromptPreview = (userFunc: (text: string, language: string) => string): string => {
  const full = userFunc('[selected text]', 'English')
  return full.length > 100 ? full.substring(0, 100) + '...' : full
}

const loadToolPreferences = () => {
  const wordTools = localStorage.getItem('enabledWordTools')
  const generalTools = localStorage.getItem('enabledGeneralTools')

  if (wordTools) {
    try {
      enabledWordTools.value = new Set(JSON.parse(wordTools))
    } catch {
      enabledWordTools.value = new Set(Object.values(getWordToolDefinitions()).map(t => t.name))
    }
  } else {
    enabledWordTools.value = new Set(Object.values(getWordToolDefinitions()).map(t => t.name))
  }

  if (generalTools) {
    try {
      enabledGeneralTools.value = new Set(JSON.parse(generalTools))
    } catch {
      const generalToolNames = getGeneralToolDefinitions().map(t => t.name)
      enabledGeneralTools.value = new Set(generalToolNames)
    }
  } else {
    const generalToolNames = getGeneralToolDefinitions().map(t => t.name)
    enabledGeneralTools.value = new Set(generalToolNames)
  }
}

const saveToolPreferences = () => {
  localStorage.setItem('enabledWordTools', JSON.stringify([...enabledWordTools.value]))
  localStorage.setItem('enabledGeneralTools', JSON.stringify([...enabledGeneralTools.value]))
}

const toggleTool = (toolName: string, isWordTool: boolean) => {
  if (isWordTool) {
    if (enabledWordTools.value.has(toolName)) {
      enabledWordTools.value.delete(toolName)
    } else {
      enabledWordTools.value.add(toolName)
    }
  } else {
    if (enabledGeneralTools.value.has(toolName)) {
      enabledGeneralTools.value.delete(toolName)
    } else {
      enabledGeneralTools.value.add(toolName)
    }
  }
  saveToolPreferences()
}

const isToolEnabled = (toolName: string, isWordTool: boolean): boolean => {
  return isWordTool ? enabledWordTools.value.has(toolName) : enabledGeneralTools.value.has(toolName)
}

const isGeneralTool = (toolName: string): boolean => {
  const generalToolNames = getGeneralToolDefinitions().map(t => t.name)
  return generalToolNames.includes(toolName as any)
}

// OpenWebUI models fetching
const refreshOpenWebUIModels = async () => {
  const baseURL = settingForm.value.openwebuiBaseURL
  const apiKey = settingForm.value.openwebuiAPIKey

  if (!baseURL || !apiKey) {
    modelsFetchError.value = 'Please configure Base URL and JWT Token first'
    return
  }

  // Prevent multiple concurrent fetches
  if (isFetchingModels.value) {
    console.log('[SettingsPage] Model fetch already in progress, skipping')
    return
  }

  isFetchingModels.value = true
  modelsFetchError.value = null

  try {
    console.log('[SettingsPage] Fetching models from Open WebUI...')
    const models = await fetchOpenWebUIModels(baseURL, apiKey)

    if (models.length === 0) {
      modelsFetchError.value = 'No models found. Make sure your Open WebUI instance is running and accessible.'
    } else {
      openwebuiDynamicModels.value = models
      saveOpenWebUIModels(models)
      modelsFetchSuccess.value = `Successfully fetched ${models.length} models from Open WebUI`
      console.log('[SettingsPage] Successfully fetched', models.length, 'models from Open WebUI')

      // Clear success message after 5 seconds
      setTimeout(() => {
        modelsFetchSuccess.value = null
      }, 5000)
    }
  } catch (error: any) {
    console.error('[SettingsPage] Failed to fetch Open WebUI models:', error)

    // More specific error messages for common issues
    if (error.message.includes('401') || error.message.includes('403')) {
      modelsFetchError.value = 'Authentication failed. Please check your JWT Token.'
    } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
      modelsFetchError.value = 'Network error. Please check your Base URL and ensure the Open WebUI server is running.'
    } else {
      modelsFetchError.value =
        error.message || 'Failed to fetch models. Make sure you are using a valid JWT Token (not API Key).'
    }
  } finally {
    isFetchingModels.value = false
  }
}

onBeforeMount(() => {
  loadPrompts()
  loadCustomModels()
  loadBuiltInPrompts()
  loadToolPreferences()
  // addWatch() is now called immediately after definition, not here
})

function backToHome() {
  router.push('/')
}
</script>

<style scoped src="./SettingsPage.css"></style>
