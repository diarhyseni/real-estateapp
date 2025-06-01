import { getProperties } from "@/lib/actions"
import PropertyCard from "@/components/property-card"
import { Property } from "@/lib/types"
import PropertyCarousel from "./property-carousel"

export default async function FeaturedProperties() {
  const properties = await getProperties({ exclusive: true }) as Property[]

  return (
    <section className="bg-[#0D1831] py-16">
      <div className="container">
        <h2 className="text-3xl font-bold text-white mb-8">Pronat Ekskluzive</h2>
        <PropertyCarousel properties={properties} />
      </div>
    </section>
  )
}
