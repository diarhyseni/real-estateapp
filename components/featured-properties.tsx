import { getProperties } from "@/lib/actions"
import PropertyCard from "@/components/property-card"
import { Property } from "@/lib/types"
import PropertyCarousel from "./property-carousel"

export default async function FeaturedProperties() {
  const properties = await getProperties({ exclusive: true }) as Property[]

  return (
    <section className="bg-gradient-to-br from-[#0D1831] to-[#1a2847] py-20">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Pronat Ekskluzive</h2>
          <p className="text-lg text-gray-300 max-w-2xl">
            Zgjidhni nga koleksioni ynë i pronave ekskluzive, të përzgjedhura me kujdes për ju
          </p>
        </div>
        <PropertyCarousel properties={properties} />
      </div>
    </section>
  )
}
