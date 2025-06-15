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
              src="/uploads/mitrovica.jpeg"
              alt="Hero background"
              className="w-full h-full object-cover" style={{ filter: 'blur(2px)' }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="container relative z-10">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mergedCategories.map((category: any) => (
              <Link
                key={category.id}
                href={`/category/${category.value.toLowerCase()}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10" />
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <p className="text-sm">
                    {category.count} prona
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
