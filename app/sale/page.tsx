"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo, useCallback } from "react"
import PropertyCard from "@/components/property-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Property } from "@/lib/types"
import PropertyFilters from "@/components/property-filters"

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
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  )
}

export default function SalePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const memoizedProperties = useMemo(() => properties, [properties])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${baseUrl}/api/properties?status=SALE`)
        if (!response.ok) {
          throw new Error('Failed to fetch properties')
        }
        const data = await response.json()
        setProperties(data)
        setFilteredProperties(data)
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handleFilterChange = useCallback((filters: any) => {
    let filtered = [...properties]

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(property => 
        property.price >= filters.priceRange[0] && 
        property.price <= filters.priceRange[1]
      )
    }

    // Filter by bedrooms
    if (filters.bedrooms && filters.bedrooms !== 'any') {
      if (filters.bedrooms.endsWith('+')) {
        const minBedrooms = parseInt(filters.bedrooms)
        filtered = filtered.filter(property => (property.bedrooms || 0) >= minBedrooms)
      } else {
        filtered = filtered.filter(property => (property.bedrooms || 0) === parseInt(filters.bedrooms))
      }
    }

    // Filter by bathrooms
    if (filters.bathrooms && filters.bathrooms !== 'any') {
      if (filters.bathrooms.endsWith('+')) {
        const minBathrooms = parseInt(filters.bathrooms)
        filtered = filtered.filter(property => (property.bathrooms || 0) >= minBathrooms)
      } else {
        filtered = filtered.filter(property => (property.bathrooms || 0) === parseInt(filters.bathrooms))
      }
    }

    // Strict area filter: always apply if either minArea or maxArea is set
    const minArea = (typeof filters.minArea === 'number' && !isNaN(filters.minArea)) ? filters.minArea : 0;
    const maxArea = (typeof filters.maxArea === 'number' && !isNaN(filters.maxArea)) ? filters.maxArea : Infinity;
    filtered = filtered.filter(property => {
      if (property.area === undefined || property.area === null) return false;
      let areaInM2 = Number(property.area);
      if (isNaN(areaInM2)) return false;
      if (property.areaUnit) {
        const unit = property.areaUnit.toLowerCase().replace(/\s|\./g, '');
        if (unit === 'ari') areaInM2 = areaInM2 * 100;
        if (unit === 'hektar' || unit === 'hektare' || unit === 'ha') areaInM2 = areaInM2 * 10000;
      }
      return areaInM2 >= minArea && areaInM2 <= maxArea;
    });

    // Filter by features
    if (filters.hasBalcony) filtered = filtered.filter(p => p.hasBalcony)
    if (filters.hasParking) filtered = filtered.filter(p => p.hasParking)
    if (filters.hasGarden) filtered = filtered.filter(p => p.hasGarden)
    if (filters.hasPool) filtered = filtered.filter(p => p.hasPool)
    if (filters.hasSecurity) filtered = filtered.filter(p => p.hasSecurity)
    if (filters.hasGym) filtered = filtered.filter(p => p.hasGym)
    if (filters.hasElevator) filtered = filtered.filter(p => p.hasElevator)
    if (filters.hasAirConditioning) filtered = filtered.filter(p => p.hasAirConditioning)
    if (filters.hasHeating) filtered = filtered.filter(p => p.hasHeating)
    if (filters.hasInternet) filtered = filtered.filter(p => p.hasInternet)

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter(property => property.city === filters.city);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(property =>
        (property.title && property.title.toLowerCase().includes(searchLower)) ||
        (property.address && property.address.toLowerCase().includes(searchLower))
      );
    }

    setFilteredProperties(filtered)
  }, [properties])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Pronat në shitje</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <PropertyFilters 
              onFilterChange={handleFilterChange}
              initialType="SALE"
              properties={memoizedProperties}
            />
          </div>
          <div className="md:col-span-3">
            {loading ? (
              <LoadingSpinner />
            ) : filteredProperties.length > 0 ? (
              <PropertyList properties={filteredProperties} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Për momentin nuk ka prona në këtë kategori. Ju lutem kontrolloni sërish më vonë!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
