"use client"

import { useState, useEffect, useRef } from "react"
import { SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Property } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { ChevronRight, ChevronDown } from "lucide-react"

interface PropertyFiltersProps {
  onFilterChange?: (filters: any) => void
  initialType?: "RENT" | "SALE"
  properties: Property[]
}

const PRICE_STEP = 1000 // 1000€ step

export default function PropertyFilters({ onFilterChange, initialType, properties = [] }: PropertyFiltersProps) {
  console.log('PropertyFilters rendered', { onFilterChange });

  // Calculate dynamic ranges from properties
  const maxPrice = Math.ceil((properties || []).reduce((max, property) => 
    Math.max(max, property.price), 0
  ) / PRICE_STEP) * PRICE_STEP || 1000000 // Fallback to 1M if no properties

  const maxBedrooms = Math.max(...(properties || []).map(p => p.bedrooms || 0))
  const maxBathrooms = Math.max(...(properties || []).map(p => p.bathrooms || 0))
  const maxArea = Math.ceil(Math.max(...(properties || []).map(p => p.area || 0)) / 50) * 50

  // Generate dynamic options
  const BEDROOM_OPTIONS = [
    { label: "Shfaq opsionet", value: "any" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5+", value: "5+" },
  ]

  const BATHROOM_OPTIONS = [
    { label: "Shfaq opsionet", value: "any" },
    ...Array.from({ length: Math.max(1, maxBathrooms + 1) }, (_, i) => ({
      label: i === maxBathrooms ? `${i}+` : `${i}`,
      value: i === maxBathrooms ? `${i}+` : `${i}`
    }))
  ]

  const AREA_OPTIONS = [
    { label: "Shfaq opsionet", value: "any" },
    ...Array.from({ length: Math.max(1, Math.ceil(maxArea / 50)) }, (_, i) => {
      const start = i * 50
      const end = start + 50
      return {
        label: end > maxArea ? `${start}+ m²` : `${start}-${end} m²`,
        value: end > maxArea ? `${start}+` : `${start}-${end}`
      }
    })
  ]

  const [filters, setFilters] = useState({
    priceRange: [0, maxPrice],
    bedrooms: "any",
    minArea: '',
    maxArea: '',
    hasParking: false,
  })

  // Only reset filters when the properties prop reference changes
  const prevPropertiesRef = useRef<Property[] | null>(null);
  useEffect(() => {
    if (prevPropertiesRef.current !== properties) {
      setFilters({
        priceRange: [0, maxPrice],
        bedrooms: "any",
        minArea: '',
        maxArea: '',
        hasParking: false,
      });
      prevPropertiesRef.current = properties;
    }
    // eslint-disable-next-line
  }, [properties]);

  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'min' | 'max' | null>(null)
  const [activeSlider, setActiveSlider] = useState<'price' | 'area' | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Effect to handle initial collapse state based on screen width and resize
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      if (mobileView) {
        setIsCollapsed(true); // Collapse by default on mobile
      } else {
        setIsCollapsed(false); // Ensure it's not collapsed on wider screens
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      const checked = e.target.checked
      setFilters((prev) => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Price slider handlers
  const handlePriceMouseDown = (type: 'min' | 'max') => {
    setIsDragging(true)
    setDragType(type)
    setActiveSlider('price')
  }

  const handlePriceMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || activeSlider !== 'price' || !dragType) return

    const slider = e.currentTarget
    const rect = slider.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const currentMaxPrice = maxPrice
    const value = Math.round(percentage * currentMaxPrice / PRICE_STEP) * PRICE_STEP

    setFilters(prev => {
      const newRange = [...prev.priceRange] as [number, number]
      if (dragType === 'min') {
        newRange[0] = Math.min(value, prev.priceRange[1] - PRICE_STEP)
      } else {
        newRange[1] = Math.max(value, prev.priceRange[0] + PRICE_STEP)
      }
      return { ...prev, priceRange: newRange }
    })
  }

  const handlePriceMouseUp = () => {
    setIsDragging(false)
    setDragType(null)
    setActiveSlider(null)
  }

  // Update the global mouse handlers
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        if (activeSlider === 'price') handlePriceMouseUp()
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && dragType) {
        if (activeSlider === 'price') {
          const slider = document.querySelector('.price-slider')
          if (slider) {
            const rect = slider.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = Math.max(0, Math.min(1, x / rect.width))
            const currentMaxPrice = maxPrice
            const value = Math.round(percentage * currentMaxPrice / PRICE_STEP) * PRICE_STEP

            setFilters(prev => {
              const newRange = [...prev.priceRange] as [number, number]
              if (dragType === 'min') {
                newRange[0] = Math.min(value, prev.priceRange[1] - PRICE_STEP)
              } else {
                newRange[1] = Math.max(value, prev.priceRange[0] + PRICE_STEP)
              }
              return { ...prev, priceRange: newRange }
            })
          }
        }
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, dragType, maxPrice, activeSlider])

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' €'
  }

  // Update the filter change effect
  useEffect(() => {
    if (onFilterChange) {
      const finalFilters = {
        ...filters,
        minArea: filters.minArea === '' ? undefined : parseFloat(filters.minArea),
        maxArea: filters.maxArea === '' ? undefined : parseFloat(filters.maxArea),
        bedrooms: filters.bedrooms === 'any' ? undefined : filters.bedrooms,
        hasParking: filters.hasParking,
      };
      console.log('PropertyFilters sending filters:', finalFilters);
      onFilterChange(finalFilters);
    }
  }, [filters, onFilterChange]);

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between gap-2 cursor-pointer" onClick={() => {
         if (isMobile) { // Only toggle on small screens
           setIsCollapsed(!isCollapsed)
         }
        }}>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filtrat</h3>
        </div>
        {isMobile && (
           isCollapsed ? (
             <ChevronRight className="h-5 w-5 text-gray-600" />
           ) : (
             <ChevronDown className="h-5 w-5 text-gray-600" />
           )
         )}
      </div>

      <div className={cn("space-y-4", isCollapsed && 'max-md:hidden')}>
        <div>
          <label className="block text-sm font-medium mb-2">Çmimi (Min - Max)</label>
          <div 
            className="relative h-2 bg-gray-200 rounded-full price-slider"
            onMouseMove={handlePriceMouseMove}
            onMouseUp={handlePriceMouseUp}
          >
            <div
              className="absolute h-full bg-blue-500 rounded-full"
              style={{
                left: `${(filters.priceRange[0] / maxPrice) * 100}%`,
                right: `${100 - (filters.priceRange[1] / maxPrice) * 100}%`
              }}
            />
            <div
              className="absolute w-4 h-4 bg-blue-500 rounded-full -mt-1 cursor-pointer"
              style={{ left: `${(filters.priceRange[0] / maxPrice) * 100}%` }}
              onMouseDown={() => handlePriceMouseDown('min')}
            />
            <div
              className="absolute w-4 h-4 bg-blue-500 rounded-full -mt-1 cursor-pointer"
              style={{ left: `${(filters.priceRange[1] / maxPrice) * 100}%` }}
              onMouseDown={() => handlePriceMouseDown('max')}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Dhomat</label>
          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {BEDROOM_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Bathroom filter commented out as requested */}
        {/*
        <div>
          <label className="block text-sm font-medium mb-2">Tualet</label>
          <select
            name="bathrooms"
            value={filters.bathrooms}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {BATHROOM_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        */}

        {/* Features section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2">Karakteristikat e pronës</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="hasParking"
                checked={filters.hasParking}
                onChange={handleChange}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">Parking</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sipërfaqja (m²)</label>
          <div className="flex gap-2">
            <Input
              type="number"
              name="minArea"
              value={filters.minArea}
              onChange={handleChange}
              placeholder="Min"
              min={0}
              className="w-1/2"
            />
            <Input
              type="number"
              name="maxArea"
              value={filters.maxArea}
              onChange={handleChange}
              placeholder="Max"
              min={0}
              className="w-1/2"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 