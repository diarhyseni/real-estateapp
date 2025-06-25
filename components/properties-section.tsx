"use client"

import React from "react"
import { ChevronRight, Filter, X } from "lucide-react"
import { Property } from "@/lib/types"
import { Button } from "@/components/ui/button"
import PropertyCard from "@/components/property-card"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import PropertyFilters from "@/components/property-filters"

export default function PropertiesSection({ properties }: { properties: Property[] }) {
  const [showAll, setShowAll] = React.useState(false)
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [filtered, setFiltered] = React.useState<Property[]>(properties)
  const [pendingFilters, setPendingFilters] = React.useState<any>(null)
  const [filtersApplied, setFiltersApplied] = React.useState(false)

  // When properties change, reset filtered
  React.useEffect(() => {
    setFiltered(properties)
    setFiltersApplied(false)
  }, [properties])

  const displayedProperties = showAll ? filtered : filtered.slice(0, 8)

  // Map properties to ensure 'image' field is set
  const mappedProperties = displayedProperties.map((property) => ({
    ...property,
    image: property.images && property.images.length > 0 ? property.images[0] : "",
    areaUnit: property.areaUnit || 'm²',
    city: (property as any).city || "Prishtinë",
    postalCode: (property as any).postalCode || null
  }))

  // Handler for applying filters
  const handleApplyFilters = () => {
    if (!pendingFilters) return;
    let filtered = [...properties]
    if (pendingFilters.priceRange) {
      filtered = filtered.filter(property => 
        property.price >= pendingFilters.priceRange[0] && 
        property.price <= pendingFilters.priceRange[1]
      )
    }
    if (pendingFilters.city) {
      filtered = filtered.filter(property => property.city === pendingFilters.city)
    }
    if (pendingFilters.minArea || pendingFilters.maxArea) {
      filtered = filtered.filter(property => {
        // Convert area based on unit
        let convertedArea = property.area;
        if (property.areaUnit === 'ari') {
          convertedArea = property.area * 100; // Convert ari to m²
        } else if (property.areaUnit === 'hektar') {
          convertedArea = property.area * 10000; // Convert hektar to m²
        }
        
        if (pendingFilters.minArea && pendingFilters.maxArea) {
          return convertedArea >= Number(pendingFilters.minArea) && convertedArea <= Number(pendingFilters.maxArea);
        } else if (pendingFilters.minArea) {
          return convertedArea >= Number(pendingFilters.minArea);
        } else if (pendingFilters.maxArea) {
          return convertedArea <= Number(pendingFilters.maxArea);
        }
        return true;
      })
    }
    if (pendingFilters.bedrooms && pendingFilters.bedrooms !== 'any') {
      filtered = filtered.filter(property => {
        if (pendingFilters.bedrooms === '5+') {
          return property.bedrooms >= 5;
        }
        return property.bedrooms === Number(pendingFilters.bedrooms);
      });
    }
    if (pendingFilters.search) {
      const searchTerm = pendingFilters.search.toLowerCase();
      filtered = filtered.filter(property => 
        property.title?.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm) ||
        property.location?.toLowerCase().includes(searchTerm) ||
        property.city?.toLowerCase().includes(searchTerm)
      );
    }
    setFiltered(filtered)
    setFiltersApplied(true)
    setFilterOpen(false)
  }

  // Handler for clearing filters
  const handleClearFilters = () => {
    setFiltered(properties)
    setPendingFilters(null)
    setFiltersApplied(false)
    setShowAll(false)
  }

  return (
    <section id="pronat-e-fundit" className="py-16 container">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Pronat e Fundit</h2>
        <div className="flex gap-2 items-center">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90 px-6" aria-label="Filtro">
                <Filter className="h-4 w-4 text-white" /> Filtro
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[350px]" onInteractOutside={(e) => e.preventDefault()}>
              <PropertyFilters 
                properties={properties}
                onFilterChange={filters => {
                  setPendingFilters(filters);
                  // Don't close the popover when filters change
                }}
              />
              <Button className="w-full mt-4" onClick={handleApplyFilters}>
                Apliko filtrat
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {filtered.length === 0 && filtersApplied ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nuk u gjetën prona që përputhen me filtrat e zgjedhur.</p>
          <Button 
            onClick={handleClearFilters}
            variant="outline"
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Pastro filtrat
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mappedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          {filtered.length > 8 && (
            <div className="flex justify-center mt-8">
              <Button 
                className="gap-2 bg-brand-primary text-white hover:bg-brand-primary/90 px-6"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    Shfaq më pak <ChevronRight className="h-4 w-4 text-white -rotate-90" />
                  </>
                ) : (
                  <>
                    Shfaq të gjitha <ChevronRight className="h-4 w-4 text-white rotate-90" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
} 