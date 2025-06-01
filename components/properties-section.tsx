"use client"

import React from "react"
import { ChevronRight } from "lucide-react"
import { Property } from "@/lib/types"
import { Button } from "@/components/ui/button"
import PropertyCard from "@/components/property-card"

export default function PropertiesSection({ properties }: { properties: Property[] }) {
  const [showAll, setShowAll] = React.useState(false)
  const displayedProperties = showAll ? properties : properties.slice(0, 8)

  // Map properties to ensure 'image' field is set
  const mappedProperties = displayedProperties.map((property) => ({
    ...property,
    image: property.images && property.images.length > 0 ? property.images[0] : "",
    areaUnit: property.areaUnit || 'm²',
    city: (property as any).city || "Prishtinë",
    postalCode: (property as any).postalCode || null
  }))

  return (
    <section id="pronat-e-fundit" className="py-16 container">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Pronat e Fundit</h2>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Shfaq më pak" : "Shiko të gjitha"} <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mappedProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  )
} 