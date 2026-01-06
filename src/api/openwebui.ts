/**
 * Open WebUI API utilities for fetching models dynamically
 */

export interface OpenWebUIModel {
  id: string
  name: string
  object?: string
  created?: number
  owned_by?: string
}

export interface OpenWebUIModelsResponse {
  data: OpenWebUIModel[]
}

/**
 * Fetch available models from Open WebUI instance
 * @param baseURL - Open WebUI base URL (e.g., https://wordai.hekanet.de)
 * @param jwtToken - Open WebUI JWT token (from login)
 * @returns Array of model IDs
 */
export async function fetchOpenWebUIModels(baseURL: string, jwtToken: string): Promise<string[]> {
  try {
    // Remove trailing slash and ensure we have the base URL
    const cleanBaseURL = baseURL.replace(/\/$/, '')

    // Use /api/v1/models endpoint which accepts JWT authentication
    const modelsURL = `${cleanBaseURL}/api/v1/models`

    console.log('[OpenWebUI] Fetching models from:', modelsURL)

    const response = await fetch(modelsURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      let errorMessage = `Failed to fetch models: ${response.status} ${response.statusText}`

      // Provide more specific error messages for common HTTP errors
      if (response.status === 401) {
        errorMessage = 'Authentication failed: Invalid JWT Token'
      } else if (response.status === 403) {
        errorMessage = 'Access denied: Check your JWT Token permissions'
      } else if (response.status === 404) {
        errorMessage = 'Open WebUI API endpoint not found. Check your Base URL.'
      } else if (response.status >= 500) {
        errorMessage = 'Open WebUI server error. Please check if your instance is running.'
      }

      throw new Error(errorMessage)
    }

    const data: OpenWebUIModelsResponse = await response.json()

    // Extract model IDs from the response
    const modelIds = data.data.map((model: OpenWebUIModel) => model.id)

    console.log('[OpenWebUI] Fetched models:', modelIds)

    return modelIds
  } catch (error) {
    console.error('[OpenWebUI] Error fetching models:', error)

    // Provide more specific error messages for network issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Could not connect to Open WebUI server. Please check your Base URL.')
    } else if (error instanceof Error) {
      throw error
    } else {
      throw new Error('Unknown error occurred while fetching models from Open WebUI')
    }
  }
}

/**
 * Save fetched models to localStorage
 */
export function saveOpenWebUIModels(models: string[]): void {
  localStorage.setItem('openwebuiFetchedModels', JSON.stringify(models))
  localStorage.setItem('openwebuiModelsLastFetch', new Date().toISOString())
}

/**
 * Load cached models from localStorage
 */
export function loadOpenWebUIModels(): string[] {
  try {
    const stored = localStorage.getItem('openwebuiFetchedModels')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get last fetch timestamp
 */
export function getModelsLastFetchTime(): string | null {
  return localStorage.getItem('openwebuiModelsLastFetch')
}
