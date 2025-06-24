import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Property } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PropertyCard from "@/components/property-card"
import PropertyFilter from "@/components/property-filter"
import FeaturedProperties from "@/components/featured-properties"
import HeroButtons from "@/components/hero-buttons"
import PropertiesSection from "@/components/properties-section"
import { getProperties } from "@/lib/actions"
import { cn, formatPrice } from "@/lib/utils"

const categoryImages: Record<string, { name: string; url: string; image: string }> = {
  'house': {
    name: 'Shtëpi',
    url: 'shtepi',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop',
  },
  'apartment': {
    name: 'Banesa',
    url: 'banesa',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
  },
  'office': {
    name: 'Zyre',
    url: 'zyre',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop',
  },
  'local': {
    name: 'Lokale',
    url: 'lokale',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
  },
  'land': {
    name: 'Troje',
    url: 'troje',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2032&auto=format&fit=crop',
  },
  'warehouse': {
    name: 'Depo',
    url: 'depo',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
  },
  'object': {
    name: 'Objekte',
    url: 'objekte',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
  },
}

export const dynamic = "force-dynamic";

async function getCategoriesWithCounts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/categories`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data
}

export default async function Home() {
  // Fetch initial properties
  const properties = await getProperties({}) as Property[]
  const categories = await getCategoriesWithCounts()

  // Merge DB categories with static images
  const mergedCategories = categories
    .map((cat: any) => {
      const img = categoryImages[cat.value.toLowerCase()]
      if (!img) return null
      return {
        ...cat,
        ...img,
        count: cat._count?.properties || (cat.properties?.length ?? 0),
      }
    })
    .filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative h-[700px] flex items-center">
          <div className="absolute inset-0">
            <img
              src="/uploads/mitrovica1b.png"
              alt="Hero background"
              className="w-full h-full object-cover" style={{ filter: 'blur(3px)' }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="container relative z-10 px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Gjej Pronën e Ëndrrave Tënde
              </h1>
              <p className="text-lg md:text-xl mb-8">
                Zgjidh nga mijëra prona në rajonin e <b>Mitrovicës</b>
              </p>
              <HeroButtons />
            </div>
          </div>
        </section>

        <PropertiesSection properties={properties} />

        <FeaturedProperties />

        <section className="py-16 container">
          <h2 className="text-3xl font-bold mb-8 text-black">Kategoritë e Pronave</h2>
          <div className="grid grid-cols-12 gap-4">
            {mergedCategories.map((category: any, index: number) => {
              // Define the layout classes based on index
              const layoutClasses = [
                "col-span-6 md:col-span-4 row-span-2", // First item (large)
                "col-span-6 md:col-span-4 row-span-2 md:row-span-1", // Second item (medium)
                "col-span-6 md:col-span-4 row-span-2 md:row-span-1", // Third item (medium)
                "col-span-6 md:col-span-4 row-span-2 md:row-span-1", // Fourth item (medium)
                "col-span-6 md:col-span-4 row-span-2", // Fifth item (medium)
                "col-span-6 md:col-span-4 row-span-2 md:row-span-1", // Sixth item (extra large)
                "col-span-6 md:col-span-4 row-span-2 md:row-span-1", // Seventh item (large)
              ][index] || "col-span-6 md:col-span-4 row-span-2 md:row-span-1"; // Default fallback

              return (
                <Link
                  key={category.id}
                  href={`/category/${category.value.toLowerCase()}`}
                  className={cn(
                    "group relative overflow-hidden rounded-lg",
                    layoutClasses,
                    // Set height based on screen size and row span
                    "h-[250px] md:h-auto",
                    "md:only:[&.md\\:row-span-1]:h-[190px] md:only:[&.md\\:row-span-2]:h-[400px]"
                  )}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10" />
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                    <h3 className={cn(
                      "font-bold transition-transform duration-300 group-hover:-translate-y-1",
                      "text-xl md:text-2xl"
                    )}>
                      {category.name}
                    </h3>
                    <p className="text-sm mt-2 opacity-90">
                      {category.count} prona
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Rreth nesh Section */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8 text-black">Rreth nesh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-gray-800 mb-4">
                  Ne jemi një agjenci e pasurive të paluajtshme me përvojë shumëvjeçare në tregun e Mitrovicës dhe më gjerë. Qëllimi ynë është t'ju ndihmojmë të gjeni pronën e duhur për ju, qoftë për banim apo investim. Na vizitoni në zyrat tona ose na kontaktoni për çdo pyetje!
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Adresa:</strong> Rruga "Agim Ramadani", 10000 Prishtinë, Kosovë</li>
                  <li><strong>Tel:</strong> +383 49 123 456</li>
                  <li><strong>Email:</strong> info@mitrovicarealestate.com</li>
                </ul>
              </div>
              <div>
                <div className="w-full aspect-[16/9] rounded-lg overflow-hidden shadow">
                  <iframe
                    src="https://www.google.com/maps?q=Rruga+Agim+Ramadani,+Prishtinë,+Kosovë&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokacioni ynë"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
