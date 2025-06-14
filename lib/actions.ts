export async function getProperties(params: {
  type?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bedrooms?: number
  bathrooms?: number
  search?: string
  exclusive?: boolean
}) {
  try {
    const searchParams = new URLSearchParams()

    // If exclusive is true, we only want properties with EXCLUSIVE status
    if (params.exclusive) {
      searchParams.set('hasStatus', 'EXCLUSIVE')
      // Return early if no exclusive properties are needed
      if (!params.exclusive) return []
    } else {
      // For non-exclusive queries, add other filters
      if (params.type) searchParams.set('type', params.type)
      if (params.category) searchParams.set('category', params.category)
      if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString())
      if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString())
      if (params.minArea) searchParams.set('minArea', params.minArea.toString())
      if (params.maxArea) searchParams.set('maxArea', params.maxArea.toString())
      if (params.bedrooms) searchParams.set('bedrooms', params.bedrooms.toString())
      if (params.bathrooms) searchParams.set('bathrooms', params.bathrooms.toString())
      if (params.search) searchParams.set('search', params.search)
    }

    // Get the base URL for the API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const url = `${baseUrl}/api/properties?${searchParams.toString()}`
    
    console.log('Fetching properties from:', url)
    console.log('Request params:', params)

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { error: 'Failed to parse error response' }
        }
        
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: url
        })

        // If we have detailed error information from the server, use it
        if (errorData && errorData.details) {
          throw new Error(`Failed to fetch properties: ${errorData.details}`)
        }
        
        throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Received ${data.length} properties`)
      return data
    } catch (fetchError) {
      console.error('Fetch error:', {
        error: fetchError,
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      })
      throw fetchError
    }
  } catch (error) {
    console.error('Error in getProperties:', error)
    throw error
  }
} 