"use client"

import { useEffect, useState, use } from "react"
import { Property } from "@/lib/types"
import PropertyDetails from "@/components/property-details"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Loader2 } from "lucide-react"
import PropertyCard from "@/components/property-card"

type PropertyWithUser = Property & {
  user?: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  }
  address?: string
}

export default function PropertyPage({ params: promisedParams }: { params: Promise<{ id: string }> }) {
  const params = use(promisedParams);
  const [property, setProperty] = useState<PropertyWithUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarProperties, setSimilarProperties] = useState<PropertyWithUser[]>([])

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/properties/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch property')
        
        const data = await response.json()
        
        // Transform the user data to match the expected type
        const transformedProperty: PropertyWithUser = {
          ...data,
          user: data.user ? {
            id: data.user.id,
            name: data.user.name || null,
            email: data.user.email || null,
            phone: data.user.phone || null,
            image: data.user.image || null
          } : undefined
        }
        
        setProperty(transformedProperty)

        // Fetch similar properties
        fetchSimilarProperties(transformedProperty)
      } catch (error) {
        console.error('Error fetching property:', error)
        setError('Failed to load property')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchSimilarProperties = async (currentProperty: PropertyWithUser) => {
      try {
        // 1. Fetch by same category
        let response = await fetch(`/api/properties?category=${currentProperty.category?.id}`)
        let data = await response.json()
        // Exclude current property
        let similar = data.filter((p: any) => p.id !== currentProperty.id)
        // If less than 3, fetch by type and fill
        const typeValue = currentProperty.type || null;
        if (similar.length < 3 && typeValue) {
          const needed = 3 - similar.length
          let typeRes = await fetch(`/api/properties?type=${typeValue}`)
          let typeData = await typeRes.json()
          // Exclude current property and already included
          let more = typeData.filter((p: any) => p.id !== currentProperty.id && !similar.some((sp: any) => sp.id === p.id))
          similar = [...similar, ...more.slice(0, needed)]
        }
        setSimilarProperties(similar.slice(0, 3))
      } catch (err) {
        setSimilarProperties([])
      }
    }

    fetchProperty()
  }, [params.id])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Property not found</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <PropertyDetails property={property} />
        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Prona të ngjajshme</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
