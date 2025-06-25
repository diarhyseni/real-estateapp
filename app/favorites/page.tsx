"use client"

import { useFavorites } from "@/lib/favorites-context"
import PropertyCard from "@/components/property-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Property } from "@/lib/types"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const fetchedProperties = await Promise.all(
          favorites.map(async (id) => {
            try {
              const res = await fetch(`/api/properties/${id}`)
              if (!res.ok) {
                throw new Error(`Failed to fetch property ${id}`)
              }
              return res.json()
            } catch (err) {
              console.error(`Error fetching property ${id}:`, err)
              return null
            }
          })
        )
        
        // Filter out any null results (failed fetches)
        const validProperties = fetchedProperties.filter(property => property !== null)
        setProperties(validProperties as Property[])
      } catch (err) {
        console.error('Error fetching favorites:', err)
        setError('Gabim gjatë ngarkimit të pronave të preferuara')
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [favorites])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-8">Pronat e preferuara</h1>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Duke ngarkuar pronat e preferuara...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-8">Pronat e preferuara</h1>
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Pronat e preferuara</h1>
        
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Heart className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Nuk keni prona të preferuara
            </h2>
            <p className="text-gray-500">
              Klikoni ikonën e zemrës në çdo pronë për ta shtuar në të preferuarat
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
