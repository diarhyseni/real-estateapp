"use client"

import { useFavorites } from "@/lib/favorites-context"
import PropertyCard from "@/components/property-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Property } from "@/lib/types"
import { useState, useEffect } from "react"

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    const fetchFavorites = async () => {
      const fetchedProperties = await Promise.all(
        favorites.map(async (id) => {
          const res = await fetch(`/api/properties/${id}`)
          return res.json()
        })
      )
      setProperties(fetchedProperties as unknown as Property[])
    }
    fetchFavorites()
  }, [favorites])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Pronat e preferuara</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
