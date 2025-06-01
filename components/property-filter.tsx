"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface PropertyFilterProps {
  vertical?: boolean
  type?: "sale" | "rent" | "exclusive"
  category?: string
}

export default function PropertyFilter({ vertical = false, type, category }: PropertyFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(category || searchParams.get("category") || "all")
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number.parseInt(searchParams.get("minPrice") || "0"),
    Number.parseInt(searchParams.get("maxPrice") || "1000000"),
  ])
  const [areaRange, setAreaRange] = useState<[number, number]>([
    Number.parseInt(searchParams.get("minArea") || "0"),
    Number.parseInt(searchParams.get("maxArea") || "500"),
  ])
  const [bedrooms, setBedrooms] = useState<string | null>(searchParams.get("bedrooms"))
  const [bathrooms, setBathrooms] = useState<string | null>(searchParams.get("bathrooms"))

  // Features checkboxes
  const [features, setFeatures] = useState<Record<string, boolean>>({
    balcony: searchParams.get("balcony") === "true",
    parking: searchParams.get("parking") === "true",
    elevator: searchParams.get("elevator") === "true",
    furnished: searchParams.get("furnished") === "true",
    ac: searchParams.get("ac") === "true",
    heating: searchParams.get("heating") === "true",
  })

  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams()

    if (searchTerm) params.set("search", searchTerm)
    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory)
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < 1000000) params.set("maxPrice", priceRange[1].toString())
    if (areaRange[0] > 0) params.set("minArea", areaRange[0].toString())
    if (areaRange[1] < 500) params.set("maxArea", areaRange[1].toString())
    if (bedrooms) params.set("bedrooms", bedrooms)
    if (bathrooms) params.set("bathrooms", bathrooms)

    // Add features
    Object.entries(features).forEach(([key, value]) => {
      if (value) params.set(key, "true")
    })

    // Determine the base URL based on the type
    let baseUrl = "/"
    if (type === "sale") baseUrl = "/sale"
    else if (type === "rent") baseUrl = "/rent"
    else if (type === "exclusive") baseUrl = "/exclusive"
    else if (category) baseUrl = `/category/${category}`

    // Navigate to the URL with the search parameters
    router.push(`${baseUrl}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory(category || "all")
    setPriceRange([0, 1000000])
    setAreaRange([0, 500])
    setBedrooms(null)
    setBathrooms(null)
    setFeatures({
      balcony: false,
      parking: false,
      elevator: false,
      furnished: false,
      ac: false,
      heating: false,
    })

    // Navigate to the base URL without parameters
    let baseUrl = "/"
    if (type === "sale") baseUrl = "/sale"
    else if (type === "rent") baseUrl = "/rent"
    else if (type === "exclusive") baseUrl = "/exclusive"
    else if (category) baseUrl = `/category/${category}`

    router.push(baseUrl)
  }

  const handleBedroomSelect = (value: string) => {
    setBedrooms(bedrooms === value ? null : value)
  }

  const handleBathroomSelect = (value: string) => {
    setBathrooms(bathrooms === value ? null : value)
  }

  const toggleFeature = (feature: string) => {
    setFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }))
  }

  return (
    <div className={`grid ${vertical ? "gap-6" : "gap-4"}`}>
      <div className={`grid ${vertical ? "grid-cols-1 gap-4" : "grid-cols-1 md:grid-cols-3 gap-4"}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            placeholder="Kërko lokacion ose pronë..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!category && (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="text-[#0D1831] font-medium">
              <SelectValue placeholder="Kategoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha</SelectItem>
              <SelectItem value="house">Shtëpi</SelectItem>
              <SelectItem value="apartment">Banesa</SelectItem>
              <SelectItem value="office">Zyre</SelectItem>
              <SelectItem value="commercial">Lokale</SelectItem>
              <SelectItem value="land">Troje</SelectItem>
              <SelectItem value="warehouse">Depo</SelectItem>
              <SelectItem value="building">Objekte</SelectItem>
            </SelectContent>
          </Select>
        )}

        {!vertical && (
          <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white" onClick={handleSearch}>
            Kërko
          </Button>
        )}
      </div>

      <div className={`grid ${vertical ? "grid-cols-1 gap-6" : "grid-cols-1 md:grid-cols-2 gap-6"}`}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Çmimi (€)</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-24 bg-slate-100 px-2 py-1 rounded text-sm border border-slate-200 focus:border-[#0D1831] focus:outline-none text-[#0D1831] font-medium placeholder:text-slate-400"
                  placeholder="Min €"
                />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative">
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-24 bg-slate-100 px-2 py-1 rounded text-sm border border-slate-200 focus:border-[#0D1831] focus:outline-none text-[#0D1831] font-medium placeholder:text-slate-400"
                  placeholder="Max €"
                />
              </div>
            </div>
          </div>
          <div className="px-2">
            <Slider
              value={[priceRange[0], priceRange[1]]}
              max={1000000}
              step={10000}
              onValueChange={(value) => setPriceRange(value as [number, number])}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Sipërfaqja (m²)</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  value={areaRange[0]}
                  onChange={(e) => setAreaRange([Number(e.target.value), areaRange[1]])}
                  className="w-20 bg-slate-100 px-2 py-1 rounded text-sm border border-slate-200 focus:border-[#0D1831] focus:outline-none text-[#0D1831] font-medium placeholder:text-slate-400"
                  placeholder="Min m²"
                />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative">
                <input
                  type="number"
                  value={areaRange[1]}
                  onChange={(e) => setAreaRange([areaRange[0], Number(e.target.value)])}
                  className="w-20 bg-slate-100 px-2 py-1 rounded text-sm border border-slate-200 focus:border-[#0D1831] focus:outline-none text-[#0D1831] font-medium placeholder:text-slate-400"
                  placeholder="Max m²"
                />
              </div>
            </div>
          </div>
          <div className="px-2">
            <Slider
              value={[areaRange[0], areaRange[1]]}
              max={500}
              step={10}
              onValueChange={(value) => setAreaRange(value as [number, number])}
            />
          </div>
        </div>
      </div>

      {vertical && (
        <>
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Dhomat e gjumit</h4>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "3", "4", "5+"].map((num) => (
                <Button
                  key={num}
                  variant={bedrooms === num ? "default" : "outline"}
                  className={`h-8 px-3 rounded-full ${bedrooms === num ? "bg-brand-primary" : ""}`}
                  size="sm"
                  onClick={() => handleBedroomSelect(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Banjot</h4>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "3", "4+"].map((num) => (
                <Button
                  key={num}
                  variant={bathrooms === num ? "default" : "outline"}
                  className={`h-8 px-3 rounded-full ${bathrooms === num ? "bg-brand-primary" : ""}`}
                  size="sm"
                  onClick={() => handleBathroomSelect(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Karakteristikat</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "balcony", label: "Ballkon" },
                { id: "parking", label: "Parking" },
                { id: "elevator", label: "Ashensor" },
                { id: "furnished", label: "Mobiluar" },
                { id: "ac", label: "Ajër i kondicionuar" },
                { id: "heating", label: "Ngrohje qendrore" },
              ].map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${feature.id}`}
                    checked={features[feature.id]}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                  <Label htmlFor={`feature-${feature.id}`} className="text-sm">
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white w-full" onClick={handleSearch}>
              Apliko filtrat
            </Button>
            <Button variant="outline" className="w-full" onClick={handleClearFilters}>
              Pastro filtrat
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
