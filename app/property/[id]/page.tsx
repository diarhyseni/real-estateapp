import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import PropertyDetails from "@/components/property-details"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Property } from "@/lib/types"
import { cn, formatPrice } from "@/lib/utils"

export default async function PropertyPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound()
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        typeRelation: true,
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        }
      }
    })

    if (!property) {
      console.log('Property not found with ID:', params.id)
      notFound()
    }

    // Transform the data to match the expected Property type
    const typedProperty: Property = {
      id: property.id,
      title: property.title,
      description: property.description || undefined,
      price: property.price,
      currency: property.currency,
      type: property.typeRelation?.name,
      category: property.category ? {
        id: property.category.id,
        name: property.category.name,
        value: property.category.value
      } : undefined,
      categoryId: property.categoryId,
      user: property.user ? {
        id: property.user.id,
        name: property.user.name || undefined,
        email: property.user.email || undefined,
        phone: property.user.phone || undefined,
        image: property.user.image || undefined
      } : undefined,
      userId: property.userId || undefined,
      location: property.location,
      bedrooms: property.bedrooms || undefined,
      bathrooms: property.bathrooms || undefined,
      area: property.area,
      areaUnit: property.areaUnit,
      parking: property.parking || undefined,
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
      isExclusive: property.isExclusive,
      hasBalcony: property.hasBalcony,
      hasGarden: property.hasGarden,
      hasPool: property.hasPool,
      hasSecurity: property.hasSecurity,
      hasAirConditioning: property.hasAirConditioning,
      hasHeating: property.hasHeating,
      hasInternet: property.hasInternet,
      hasElevator: property.hasElevator,
      latitude: property.latitude ? parseFloat(property.latitude) : undefined,
      longitude: property.longitude ? parseFloat(property.longitude) : undefined,
      characteristics: property.characteristics,
      nearbyPlaces: property.nearbyPlaces,
      images: property.images,
      statuses: property.statuses,
      googleMapsIframe: property.googleMapsIframe || undefined,
    }

    console.log('Property data:', JSON.stringify(typedProperty, null, 2))

    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <PropertyDetails property={typedProperty} />
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Error fetching property:', error)
    throw error
  }
}
