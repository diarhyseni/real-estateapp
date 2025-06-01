"use client"

import { useState, useEffect, useMemo } from "react"
import PropertyCard from "@/components/property-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PropertyFilters from "@/components/property-filters"
import { Property } from "@/lib/types"

export default function HousePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const fetchProperties = async (filters: any) => {
    if (!mounted) return
    
    setLoading(true)
    try {
      const searchParams = new URLSearchParams()
      searchParams.set('category', 'HOUSE')
      
      if (filters.priceRange) {
        searchParams.set('priceMin', filters.priceRange[0])
        searchParams.set('priceMax', filters.priceRange[1])
      }
      if (filters.bedrooms && filters.bedrooms !== 'any' && filters.bedrooms !== undefined) searchParams.set('bedrooms', filters.bedrooms)
      if (filters.bathrooms && filters.bathrooms !== 'any' && filters.bathrooms !== undefined) searchParams.set('bathrooms', filters.bathrooms)
      if (filters.area && filters.area !== 'any' && filters.area !== undefined) searchParams.set('area', filters.area)
      
      // Add feature filters
      Object.entries(filters).forEach(([key, value]) => {
        if (key.startsWith('has') && value === true) {
          searchParams.set(key, 'true')
        }
      })

      const response = await fetch(`/api/properties?${searchParams.toString()}`)
      const data = await response.json()
      if (mounted) {
        console.log('Fetched properties for HOUSE:', data)
        setProperties(data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      if (mounted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchProperties({ category: 'HOUSE' })
    
    return () => {
      setMounted(false)
    }
  }, [])

  const memoizedProperties = useMemo(() => properties, [properties])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Shtëpi</h1>
        <div className="flex gap-8">
          <aside className="w-80 flex-shrink-0">
            <PropertyFilters 
              onFilterChange={fetchProperties}
              initialType="HOUSE"
              properties={memoizedProperties}
            />
          </aside>
          <div className="flex-1">
            {loading ? (
              <div>Duke u ngarkuar...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 