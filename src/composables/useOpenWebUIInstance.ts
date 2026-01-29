/**
 * Composable for managing Open-WebUI instance selection
 * Automatically resolves the correct proxy endpoint based on user-friendly URLs
 */

import { watch } from 'vue'
import type { Ref } from 'vue'

export type OpenWebUIInstance = 'jachat' | 'bhk' | 'jachat-external' | 'custom'

export interface OpenWebUIInstanceConfig {
  jachat: string
  bhk: string
  'jachat-external': string
}

// Default instance URLs (proxied through nginx)
export const DEFAULT_INSTANCE_URLS: OpenWebUIInstanceConfig = {
  jachat: 'http://localhost:3100/jachat-api',
  bhk: 'http://localhost:3100/bhk-api',
  'jachat-external': 'https://wordai.hekanet.de',
}

/**
 * Domain-to-proxy-path mapping
 * Maps user-friendly URLs to internal proxy paths
 */
export const DOMAIN_PROXY_MAP: Record<string, string> = {
  'jachat.hekanet.de': '/jachat-api',
  'localhost:3010': '/jachat-api',
  'chat.bhk-x.de': '/bhk-api',
  'localhost:3000': '/bhk-api',
  'wordai.hekanet.de': '', // External instance, no proxy needed
}

/**
 * Resolve base URL from user-friendly OpenWebUI URL and plugin URL
 * @param openwebuiURL - User's OpenWebUI instance URL (e.g., https://jachat.hekanet.de, http://localhost:3010)
 * @param pluginURL - Plugin URL (e.g., https://wordai.hekanet.de, http://localhost:3100)
 * @returns Resolved base URL for API calls
 */
export function resolveBaseURL(openwebuiURL: string, pluginURL: string): string {
  if (!openwebuiURL || !pluginURL) {
    return ''
  }

  try {
    // Clean URLs
    const cleanOpenWebUI = openwebuiURL.trim().replace(/\/$/, '')
    const cleanPlugin = pluginURL.trim().replace(/\/$/, '')

    // Extract domain from OpenWebUI URL
    const openwebuiDomain = extractDomain(cleanOpenWebUI)

    // Check if it's a known domain that needs proxy routing
    const proxyPath = DOMAIN_PROXY_MAP[openwebuiDomain]

    if (proxyPath !== undefined) {
      // Use plugin URL + proxy path
      return `${cleanPlugin}${proxyPath}`
    } else {
      // Unknown domain - use OpenWebUI URL directly (custom instance)
      return cleanOpenWebUI
    }
  } catch (error) {
    console.error('[OpenWebUI] Error resolving base URL:', error)
    return openwebuiURL
  }
}

/**
 * Extract domain and port from URL
 * @param url - Full URL
 * @returns domain:port or domain
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    // Include port if non-standard
    if (urlObj.port && urlObj.port !== '80' && urlObj.port !== '443') {
      return `${urlObj.hostname}:${urlObj.port}`
    }
    return urlObj.hostname
  } catch {
    // Fallback: try to extract manually
    const match = url.match(/^https?:\/\/([^\/]+)/)
    return match ? match[1] : url
  }
}

/**
 * Get the base URL for a given instance
 */
export function getInstanceURL(instance: OpenWebUIInstance): string {
  if (instance === 'custom') {
    return ''  // User will provide custom URL
  }
  return DEFAULT_INSTANCE_URLS[instance]
}

/**
 * Get instance name for display
 */
export function getInstanceLabel(instance: OpenWebUIInstance): string {
  const labels: Record<OpenWebUIInstance, string> = {
    jachat: 'Jachat (localhost:3010)',
    bhk: 'BHK (localhost:3000)',
    'jachat-external': 'Jachat External (wordai.hekanet.de)',
    custom: 'Custom URL',
  }
  return labels[instance]
}

/**
 * Watch OpenWebUI URL and Plugin URL changes, automatically update base URL
 * @param openwebuiURLRef - Ref to user's OpenWebUI URL
 * @param pluginURLRef - Ref to plugin URL
 * @param baseURLRef - Ref to computed base URL (will be auto-updated)
 * @param onURLChange - Optional callback when URLs change
 */
export function useOpenWebUIURLResolver(
  openwebuiURLRef: Ref<string>,
  pluginURLRef: Ref<string>,
  baseURLRef: Ref<string>,
  onURLChange?: (openwebuiURL: string, pluginURL: string, resolvedBaseURL: string) => void,
) {
  // Watch for URL changes
  watch(
    [openwebuiURLRef, pluginURLRef],
    ([openwebuiURL, pluginURL]) => {
      const resolvedURL = resolveBaseURL(openwebuiURL, pluginURL)

      // Update base URL
      baseURLRef.value = resolvedURL

      // Callback for additional logic
      if (onURLChange) {
        onURLChange(openwebuiURL, pluginURL, resolvedURL)
      }

      console.log(`[OpenWebUI] URLs changed:`)
      console.log(`  OpenWebUI URL: ${openwebuiURL}`)
      console.log(`  Plugin URL: ${pluginURL}`)
      console.log(`  Resolved Base URL: ${resolvedURL}`)
    },
    { immediate: true },
  )

  return {
    resolveBaseURL,
  }
}

/**
 * Watch instance changes and automatically update base URL (DEPRECATED - use useOpenWebUIURLResolver)
 */
export function useOpenWebUIInstance(
  instanceRef: Ref<OpenWebUIInstance>,
  baseURLRef: Ref<string>,
  onInstanceChange?: (instance: OpenWebUIInstance, url: string) => void,
) {
  // Watch for instance changes
  watch(
    instanceRef,
    (newInstance) => {
      const url = getInstanceURL(newInstance)

      // Only update base URL if not custom (custom allows user input)
      if (newInstance !== 'custom') {
        baseURLRef.value = url
      } else if (baseURLRef.value === DEFAULT_INSTANCE_URLS.jachat || baseURLRef.value === DEFAULT_INSTANCE_URLS.bhk) {
        // If switching from preset to custom, clear the URL
        baseURLRef.value = ''
      }

      // Callback for additional logic
      if (onInstanceChange) {
        onInstanceChange(newInstance, url)
      }

      console.log(`[OpenWebUI] Instance changed to: ${newInstance}, URL: ${url || 'custom'}`)
    },
    { immediate: true },  // Run immediately on setup
  )

  return {
    getInstanceURL,
    getInstanceLabel,
  }
}

/**
 * Detect which instance a base URL belongs to
 */
export function detectInstanceFromURL(baseURL: string): OpenWebUIInstance {
  if (baseURL === DEFAULT_INSTANCE_URLS.jachat || baseURL.includes('/jachat-api')) {
    return 'jachat'
  } else if (baseURL === DEFAULT_INSTANCE_URLS.bhk || baseURL.includes('/bhk-api')) {
    return 'bhk'
  } else if (baseURL === DEFAULT_INSTANCE_URLS['jachat-external'] || baseURL.includes('wordai.hekanet.de')) {
    return 'jachat-external'
  } else {
    return 'custom'
  }
}
