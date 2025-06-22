"use client"

import { useEffect, useState, use } from "react"
import { Property } from "@/lib/types"
import PropertyDetails from "@/components/property-details"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Loader2 } from "lucide-react"
import PropertyCard from "@/components/property-card"

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

export default function PropertyPage({ params: promisedParams }: { params: Promise<{ slugId: string }> }) {
  const params = use(promisedParams);
  const [property, setProperty] = useState<PropertyWithUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarProperties, setSimilarProperties] = useState<PropertyWithUser[]>([])

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/properties/slug/${params.slugId}`)
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

        // Fetch similar properties
        fetchSimilarProperties(transformedProperty)
      } catch (error) {
        console.error('Error fetching property:', error)
        setError('Failed to load property')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchSimilarProperties = async (currentProperty: PropertyWithUser) => {
      function shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }
      try {
        // Fetch all properties except the current one
        const res = await fetch(`/api/properties`);
        let all = await res.json();
        all = all.filter((p: any) => p.id !== currentProperty.id);

        // 1. Same status (SALE/RENT)
        const currentStatus = currentProperty.statuses?.[0];
        let sameStatus = all.filter((p: any) => p.statuses && p.statuses[0] === currentStatus);

        // 2. Same category within same status
        let sameStatusCategory = sameStatus.filter(
          (p: any) => p.category?.id === currentProperty.category?.id
        );
        sameStatusCategory = shuffle(sameStatusCategory);

        // 3. Same type within same status (but not already in sameStatusCategory)
        let sameStatusType = sameStatus.filter(
          (p: any) => p.type === currentProperty.type && !sameStatusCategory.some((sp: any) => sp.id === p.id)
        );
        sameStatusType = shuffle(sameStatusType);

        // 4. Fill with other same status
        let otherSameStatus = sameStatus.filter(
          (p: any) => !sameStatusCategory.some((sp: any) => sp.id === p.id) && !sameStatusType.some((sp: any) => sp.id === p.id)
        );
        otherSameStatus = shuffle(otherSameStatus);

        // 5. If still not enough, fill with any others
        let others = all.filter(
          (p: any) => !sameStatus.some((sp: any) => sp.id === p.id)
        );
        others = shuffle(others);

        // Combine in order of priority
        let similar = [
          ...sameStatusCategory,
          ...sameStatusType,
          ...otherSameStatus,
          ...others
        ];

        setSimilarProperties(similar.slice(0, 3));
      } catch (err) {
        setSimilarProperties([]);
      }
    }

    fetchProperty()
  }, [params.slugId])

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
        <PropertyDetails property={property} similarProperties={similarProperties} />
        {/* Similar Properties Section is now rendered inside PropertyDetails */}
      </main>
      <Footer />
    </div>
  )
} 