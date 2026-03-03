/**
 * Open WebUI Knowledge Base & RAG API integration
 * Compatible with Open WebUI v0.8.5
 *
 * Endpoints used:
 *   GET  /api/v1/knowledge/           - List knowledge bases
 *   GET  /api/v1/knowledge/{id}       - Get knowledge base details
 *   GET  /api/v1/knowledge/{id}/files - List files in a knowledge base
 *   POST /api/v1/retrieval/query/collection - Query across knowledge base collections
 */

export interface KnowledgeBase {
  id: string
  user_id: string
  name: string
  description: string
  meta: Record<string, any> | null
  access_grants: Array<{ principal_type: string; principal_id: string; permission: string }>
  created_at: number
  updated_at: number
}

export interface KnowledgeListResponse {
  items: KnowledgeBase[]
  total: number
}

export interface KnowledgeFile {
  id: string
  filename: string
  file_id?: string
  created_at: number
  updated_at: number
  data: Record<string, any> | null
  metadata: Record<string, any> | null
}

export interface KnowledgeFileListResponse {
  items: KnowledgeFile[]
  total: number
}

export interface RetrievalResult {
  distances: number[][]
  documents: string[][]
  metadatas: Array<Array<Record<string, any>>>
}

/**
 * Fetch all knowledge bases from Open WebUI
 * GET /api/v1/knowledge/?page=1
 */
export async function fetchKnowledgeBases(
  baseURL: string,
  jwtToken: string,
): Promise<KnowledgeBase[]> {
  const cleanBaseURL = baseURL.replace(/\/$/, '')
  const url = `${cleanBaseURL}/api/v1/knowledge/`

  console.log('[OpenWebUI RAG] Fetching knowledge bases from:', url)

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed: Invalid or expired JWT Token')
    } else if (response.status === 403) {
      throw new Error('Access denied: Check your permissions')
    }
    throw new Error(`Failed to fetch knowledge bases: ${response.status} ${response.statusText}`)
  }

  const data: KnowledgeListResponse = await response.json()
  console.log('[OpenWebUI RAG] Fetched knowledge bases:', data.total)
  return data.items || []
}

/**
 * Fetch files for a specific knowledge base
 * GET /api/v1/knowledge/{id}/files
 */
export async function fetchKnowledgeFiles(
  baseURL: string,
  jwtToken: string,
  knowledgeBaseId: string,
): Promise<KnowledgeFile[]> {
  const cleanBaseURL = baseURL.replace(/\/$/, '')
  const url = `${cleanBaseURL}/api/v1/knowledge/${knowledgeBaseId}/files`

  console.log('[OpenWebUI RAG] Fetching files for knowledge base:', knowledgeBaseId)

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Knowledge base not found: ${knowledgeBaseId}`)
    }
    throw new Error(`Failed to fetch knowledge files: ${response.status} ${response.statusText}`)
  }

  const data: KnowledgeFileListResponse = await response.json()
  console.log('[OpenWebUI RAG] Fetched files:', data.total)
  return data.items || []
}

/**
 * Query knowledge base collections via the retrieval API
 * POST /api/v1/retrieval/query/collection
 */
export async function queryKnowledge(
  baseURL: string,
  jwtToken: string,
  query: string,
  options: {
    collectionNames?: string[]
    k?: number
    hybrid?: boolean
  },
): Promise<RetrievalResult> {
  const cleanBaseURL = baseURL.replace(/\/$/, '')
  const url = `${cleanBaseURL}/api/v1/retrieval/query/collection`

  console.log('[OpenWebUI RAG] Querying collections:', options.collectionNames, 'query:', query)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collection_names: options.collectionNames || [],
      query,
      k: options.k ?? 5,
      hybrid: options.hybrid ?? null,
    }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed: Invalid or expired JWT Token')
    }
    throw new Error(`Failed to query knowledge: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
