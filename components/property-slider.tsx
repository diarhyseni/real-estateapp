"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import PropertyCard from "@/components/property-card"
import { Property } from "@/lib/types"

interface PropertySliderProps {
  properties: Property[]
}

export default function PropertySlider({ properties }: PropertySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 3 >= properties.length ? 0 : prev + 3))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 3 < 0 ? Math.floor((properties.length - 1) / 3) * 3 : prev - 3))
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.slice(currentIndex, currentIndex + 3).map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/20"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </Button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/20"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  )
} 