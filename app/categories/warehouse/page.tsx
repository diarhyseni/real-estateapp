"use client"

import { useState, useEffect, useMemo } from "react"
import PropertyCard from "@/components/property-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PropertyFilters from "@/components/property-filters"
import { Property } from "@/lib/types"
import AddCategoryModal from "@/components/admin/AddCategoryModal"

export default function WarehousePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const memoizedProperties = useMemo(() => properties, [properties])

  const fetchProperties = async (filters: any) => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams()
      searchParams.set('category', 'WAREHOUSE')
      
      if (filters.priceRange) {
        searchParams.set('priceMin', filters.priceRange[0])
        searchParams.set('priceMax', filters.priceRange[1])
      }
      if (filters.bedrooms !== 'any') searchParams.set('bedrooms', filters.bedrooms)
      if (filters.bathrooms !== 'any') searchParams.set('bathrooms', filters.bathrooms)
      if (filters.area !== 'any') searchParams.set('area', filters.area)
      
      // Add feature filters
      Object.entries(filters).forEach(([key, value]) => {
        if (key.startsWith('has') && value === true) {
          searchParams.set(key, 'true')
        }
      })

      const response = await fetch(`/api/properties?${searchParams.toString()}`)
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
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
              initialType="WAREHOUSE"
              properties={memoizedProperties}
            />
          </aside>
          <div className="flex-1">
            {loading ? (
              <div>Duke u ngarkuar...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => {
                  let areaInM2 = Number(property.area);
                  if (property.areaUnit) {
                    const unit = property.areaUnit.toLowerCase().replace(/\s|\./g, '');
                    if (unit === 'ari') areaInM2 = areaInM2 * 100;
                    if (unit === 'hektar' || unit === 'hektare' || unit === 'ha') areaInM2 = areaInM2 * 10000;
                  }
                  return areaInM2 >= minArea && areaInM2 <= maxArea;
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <AddCategoryModal />
    </div>
  )
} 