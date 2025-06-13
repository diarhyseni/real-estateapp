"use client"

import { useEffect, useState } from "react"
import { Property } from "@/lib/types"
import PropertyDetails from "@/components/property-details"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Loader2 } from "lucide-react"

type PropertyWithUser = Property & {
  user?: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  }
  address?: string
}

export default function PropertyPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<PropertyWithUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/properties/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch property')
        
        const data = await response.json()
        
        // Transform the user data to match the expected type
        const transformedProperty: PropertyWithUser = {
          ...data,
          user: data.user ? {
            id: data.user.id,
            name: data.user.name || null,
            email: data.user.email || null,
            phone: data.user.phone || null,
            image: data.user.image || null
          } : undefined
        }
        
        setProperty(transformedProperty)
      } catch (error) {
        console.error('Error fetching property:', error)
        setError('Failed to load property')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [params.id])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Property not found</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <PropertyDetails property={property} />
      </main>
      <Footer />
    </div>
  )
}
