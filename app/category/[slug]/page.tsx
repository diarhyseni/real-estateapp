"use client"

import { notFound } from "next/navigation"
import { useEffect, useState, useMemo, useCallback, use } from "react"
import React from "react"
import PropertyCard from "@/components/property-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Property } from "@/lib/types"
import PropertyFilters from "@/components/property-filters"
import { Suspense } from "react"
import { Loader2, Search } from "lucide-react"

function PropertyList({ properties }: { properties: Property[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  )
}

export default function CategoryPage({ params: promisedParams }: { params: Promise<{ slug: string }> }) {
  const params = use(promisedParams);
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchProperties = async (filters?: any) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams({
        category: params.slug.toUpperCase(),
        ...filters
      })

      const response = await fetch(`/api/properties/category?${queryParams}`)
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
  }, [params.slug])

  const memoizedProperties = useMemo(() => {
    let filtered = properties

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(property =>
        (property.title && property.title.toLowerCase().includes(searchLower)) ||
        (property.location && property.location.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }, [properties, searchQuery])

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
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : memoizedProperties.length === 0 ? (
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
