/**
 * Composable for managing Open-WebUI instance URL resolution
 * Resolves the correct proxy endpoint based on user-friendly URLs and the current plugin host
 */

import { watch } from 'vue'
import type { Ref } from 'vue'

/**
 * Domain-to-proxy-path mapping
 * Maps user-friendly OpenWebUI URLs to internal nginx proxy paths
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
 * @param openwebuiURL - User's OpenWebUI instance URL (e.g., https://chat.bhk-x.de)
 * @param pluginURL - Plugin URL (e.g., https://wordai.hekanet.de)
 * @returns Resolved base URL for API calls
 */
export function resolveBaseURL(openwebuiURL: string, pluginURL: string): string {
  if (!openwebuiURL || !pluginURL) {
    return ''
  }

  try {
    const cleanOpenWebUI = openwebuiURL.trim().replace(/\/$/, '')
    const cleanPlugin = pluginURL.trim().replace(/\/$/, '')

    // Extract domain from OpenWebUI URL
    const openwebuiDomain = extractDomain(cleanOpenWebUI)

    // Check if it's a known domain that needs proxy routing
    const proxyPath = DOMAIN_PROXY_MAP[openwebuiDomain]

    if (proxyPath !== undefined) {
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
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    if (urlObj.port && urlObj.port !== '80' && urlObj.port !== '443') {
      return `${urlObj.hostname}:${urlObj.port}`
    }
    return urlObj.hostname
  } catch {
    const match = url.match(/^https?:\/\/([^\/]+)/)
    return match ? match[1] : url
  }
}

/**
 * Get the current plugin URL from the browser location
 */
export function getPluginURL(): string {
  try {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin
    }
  } catch {
    // non-browser environment
  }
  return 'http://localhost:3100'
}

/**
 * Watch OpenWebUI URL and Plugin URL changes, automatically update base URL
 */
export function useOpenWebUIURLResolver(
  openwebuiURLRef: Ref<string>,
  pluginURLRef: Ref<string>,
  baseURLRef: Ref<string>,
  onURLChange?: (openwebuiURL: string, pluginURL: string, resolvedBaseURL: string) => void,
) {
  watch(
    [openwebuiURLRef, pluginURLRef],
    ([openwebuiURL, pluginURL]) => {
      const resolvedURL = resolveBaseURL(openwebuiURL, pluginURL)

      baseURLRef.value = resolvedURL

      if (onURLChange) {
        onURLChange(openwebuiURL, pluginURL, resolvedURL)
      }
    },
    { immediate: true },
  )

  return {
    resolveBaseURL,
  }
}
