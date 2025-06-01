import { prisma } from "@/lib/db"
import PropertyCard from "@/components/property-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Property } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' }
  }) as Property[]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Properties</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property}>
              <Link href={`/admin/properties/${property.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Ndrysho
                </Button>
              </Link>
            </PropertyCard>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
