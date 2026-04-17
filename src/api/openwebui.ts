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
 * Uses /api/models which returns only models enabled for the authenticated user
 * (respects admin permissions set in OpenWebUI)
 * @param baseURL - Open WebUI base URL (e.g., https://wordai.hekanet.de/bhk-api)
 * @param jwtToken - Open WebUI JWT token (from login)
 * @returns Array of model IDs
 */
export async function fetchOpenWebUIModels(baseURL: string, jwtToken: string): Promise<string[]> {
  try {
    const cleanBaseURL = baseURL.replace(/\/$/, '')

    // /api/models returns only models the user has access to (filtered by admin permissions)
    // /api/v1/models would return ALL models regardless of permissions
    const modelsURL = `${cleanBaseURL}/api/models`

    const response = await fetch(modelsURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      let errorMessage = `Failed to fetch models: ${response.status} ${response.statusText}`

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

    const data = await response.json()

    // /api/models returns either:
    // - Array of model objects directly: [{id, name, ...}, ...]
    // - Or wrapped: {data: [{id, name, ...}, ...]}
    let models: OpenWebUIModel[]
    if (Array.isArray(data)) {
      models = data
    } else if (data.data && Array.isArray(data.data)) {
      models = data.data
    } else {
      models = []
    }

    const modelIds = models.map((model: OpenWebUIModel) => model.id)
    return modelIds
  } catch (error) {
    console.error('[OpenWebUI] Error fetching models:', error)

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
