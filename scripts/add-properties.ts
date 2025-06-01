import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Add an office property
  const office = await prisma.property.create({
    data: {
      title: "Zyre Moderne në Qendër",
      location: "Prishtinë",
      price: 150000,
      category: { connect: { value: "OFFICE" } },
      area: 120,
      images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop"],
      hasAirConditioning: true,
      hasHeating: true,
      hasElevator: true,
      hasParking: true,
      description: "Zyre moderne në qendër të Prishtinës, me pamje nga qyteti dhe të gjitha komoditetet e nevojshme.",
      city: "Prishtinë"
    }
  })

  // Add a land property
  const land = await prisma.property.create({
    data: {
      title: "Trokë në Zhur",
      location: "Zhur",
      price: 80000,
      category: { connect: { value: "LAND" } },
      area: 500,
      images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2032&auto=format&fit=crop"],
      description: "Trokë e madhe në Zhur, me qasje të lehtë dhe mundësi për ndërtim.",
      city: "Prishtinë"
    }
  })

  // Add a warehouse property for rent
  const warehouse = await prisma.property.create({
    data: {
      title: "Depo i Madh në Industri",
      location: "Prishtinë",
      price: 2000,
      category: { connect: { value: "WAREHOUSE" } },
      area: 800,
      images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"],
      hasHeating: true,
      hasParking: true,
      description: "Depo i madh në zonën industriale, ideal për ruajtje dhe logjistikë.",
      city: "Prishtinë"
    }
  })

  // Add an exclusive apartment
  const apartment = await prisma.property.create({
    data: {
      title: "Banesë Luksoze në Qendër",
      location: "Prishtinë",
      price: 250000,
      category: { connect: { value: "APARTMENT" } },
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"],
      hasAirConditioning: true,
      hasHeating: true,
      hasElevator: true,
      hasParking: true,
      hasBalcony: true,
      isFurnished: true,
      description: "Banesë luksoze në qendër të qytetit, me pamje spektakolare dhe të gjitha komoditetet.",
      city: "Prishtinë"
    }
  })

  // Add a commercial property for rent
  const commercial = await prisma.property.create({
    data: {
      title: "Lokal Komercial në Qendër",
      location: "Prishtinë",
      price: 1500,
      category: { connect: { value: "COMMERCIAL" } },
      area: 200,
      images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"],
      hasAirConditioning: true,
      hasHeating: true,
      hasParking: true,
      description: "Lokal komercial në qendër të qytetit, ideal për biznes.",
      city: "Prishtinë"
    }
  })

  // Add a building for sale
  const building = await prisma.property.create({
    data: {
      title: "Objekt i Madh në Qendër",
      location: "Prishtinë",
      price: 1200000,
      category: { connect: { value: "BUILDING" } },
      area: 2000,
      images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"],
      hasAirConditioning: true,
      hasHeating: true,
      hasElevator: true,
      hasParking: true,
      description: "Objekt i madh në qendër të qytetit, me mundësi për zhvillim të ndryshëm.",
      city: "Prishtinë"
    }
  })

  // Add a house for rent
  const house = await prisma.property.create({
    data: {
      title: "Shtëpi Familjare në Dardani",
      location: "Prishtinë",
      price: 800,
      category: { connect: { value: "HOUSE" } },
      bedrooms: 4,
      bathrooms: 2,
      area: 250,
      images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop"],
      hasAirConditioning: true,
      hasHeating: true,
      hasParking: true,
      hasBalcony: true,
      isFurnished: true,
      description: "Shtëpi familjare e bukur në Dardani, me kopsht të madh dhe të gjitha komoditetet.",
      city: "Prishtinë"
    }
  })

  console.log('Added new properties:', { office, land, warehouse, apartment, commercial, building, house })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 