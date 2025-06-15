export const dynamic = "force-dynamic";

"use client"

import { useEffect, useState, useMemo } from "react"
import { Property } from "@/lib/types"
import PropertyCard from "@/components/property-card"
import PropertyFilters from "@/components/property-filters"
import { Loader2 } from "lucide-react"

export default function CommercialPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async (filters?: any) => {
    try {
      setIsLoading(true)
      setError(null)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const queryParams = new URLSearchParams({
        category: "COMMERCIAL",
        ...filters
      })
      const response = await fetch(`${baseUrl}/api/properties/category?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch properties')
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
      setError('Failed to load properties')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const memoizedProperties = useMemo(() => properties, [properties])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <main className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No properties found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memoizedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </main>

        <aside className="w-full md:w-80">
          <PropertyFilters
            onFilterChange={fetchProperties}
            properties={memoizedProperties}
          />
        </aside>
      </div>
    </div>
  )
} 