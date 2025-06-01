"use client"

import { notFound } from "next/navigation"
import { useEffect, useState, useMemo, useCallback } from "react"
import React from "react"
import PropertyCard from "@/components/property-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Property } from "@/lib/types"
import PropertyFilters from "@/components/property-filters"
import { Suspense } from "react"

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

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<any>(null)

  const memoizedProperties = useMemo(() => properties, [properties]);

  useEffect(() => {
    const fetchCategoryAndProperties = async () => {
      try {
        // Fetch category by value (slug)
        const catRes = await fetch(`/api/categories?value=${slug}`)
        const catData = await catRes.json()
        const cat = Array.isArray(catData) ? catData[0] : catData
        if (!cat) {
          setCategory(null)
          setLoading(false)
          return
        }
        setCategory(cat)
        // Fetch properties by categoryId
        const propRes = await fetch(`/api/properties?category=${cat.id}`)
        const propData = await propRes.json()
        setProperties(propData)
        setFilteredProperties(propData)
      } catch (error) {
        setCategory(null)
        setProperties([])
        setFilteredProperties([])
      } finally {
        setLoading(false)
      }
    }
    fetchCategoryAndProperties()
  }, [slug])

  const handleFilterChange = useCallback((filters: any) => {
    console.log('CategoryPage handleFilterChange called with:', filters);
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

    // Filter by features
    if (filters.hasBalcony) filtered = filtered.filter(p => p.hasBalcony)
    if (filters.hasParking) filtered = filtered.filter(p => p.parking && p.parking > 0)
    if (filters.hasGarden) filtered = filtered.filter(p => p.hasGarden)
    if (filters.hasPool) filtered = filtered.filter(p => p.hasPool)
    if (filters.hasSecurity) filtered = filtered.filter(p => p.hasSecurity)
    if (filters.hasElevator) filtered = filtered.filter(p => p.hasElevator)
    if (filters.hasAirConditioning) filtered = filtered.filter(p => p.hasAirConditioning)
    if (filters.hasHeating) filtered = filtered.filter(p => p.hasHeating)
    if (filters.hasInternet) filtered = filtered.filter(p => p.hasInternet)

    // Strict area filter: always apply if either minArea or maxArea is set
    const minArea = (typeof filters.minArea === 'number' && !isNaN(filters.minArea)) ? filters.minArea : 0;
    const maxArea = (typeof filters.maxArea === 'number' && !isNaN(filters.maxArea)) ? filters.maxArea : Infinity;
    const allAreas = properties.map(property => {
      let areaInM2 = Number(property.area);
      if (property.areaUnit) {
        const unit = property.areaUnit.toLowerCase().replace(/\s|\./g, '');
        if (unit === 'ari') areaInM2 = areaInM2 * 100;
        if (unit === 'hektar' || unit === 'hektare' || unit === 'ha') areaInM2 = areaInM2 * 10000;
      }
      return { id: property.id, areaInM2 };
    });
    console.log('All property areas (m²):', allAreas);
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
    console.log('Filtered property IDs:', filtered.map(p => p.id));

    setFilteredProperties(filtered)
  }, [properties])

  if (loading) return <LoadingSpinner />
  if (!category) return notFound()

  console.log('CategoryPage rendered');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">{category.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <PropertyFilters 
              onFilterChange={handleFilterChange}
              initialType={"RENT"}
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
                <p className="text-gray-500">No properties found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
