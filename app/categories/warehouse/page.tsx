"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react"
import PropertyCard from "@/components/property-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PropertyFilters from "@/components/property-filters"
import { Property } from "@/lib/types"

export default function WarehousePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const memoizedProperties = useMemo(() => properties, [properties])
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async (filters?: any) => {
    try {
      setLoading(true)
      setError(null)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const queryParams = new URLSearchParams({
        category: "WAREHOUSE",
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
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties({ category: 'WAREHOUSE' })
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Depo</h1>
        <div className="flex gap-8">
          <aside className="w-80 flex-shrink-0">
            <PropertyFilters 
              onFilterChange={fetchProperties}
              properties={memoizedProperties}
              category="WAREHOUSE"
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