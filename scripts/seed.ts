const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const properties = [
  {
    title: "Modern Apartment in City Center",
    location: "Prishtinë",
    price: 120000,
    currency: "€",
    type: "SALE",
    category: "APARTMENT",
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    parking: 1,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
    isExclusive: true,
    hasBalcony: true,
    hasParking: true,
    hasElevator: true,
    isFurnished: false,
    hasAC: true,
    hasHeating: true,
    description: "Modern apartment in the heart of the city with great amenities",
    address: "Rr. Zenel Salihu, Prishtinë",
    city: "Prishtinë",
    postalCode: "10000",
    latitude: 42.6629,
    longitude: 21.1655
  },
  {
    title: "Luxury Villa with Garden",
    location: "Prishtinë",
    price: 350000,
    currency: "€",
    type: "SALE",
    category: "HOUSE",
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    parking: 2,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
    isExclusive: true,
    hasBalcony: true,
    hasParking: true,
    hasElevator: true,
    isFurnished: true,
    hasAC: true,
    hasHeating: true,
    description: "Luxury villa with beautiful garden and modern amenities",
    address: "Rr. Zenel Salihu, Prishtinë",
    city: "Prishtinë",
    postalCode: "10000",
    latitude: 42.6629,
    longitude: 21.1655
  },
  {
    title: "Cozy Studio Apartment",
    location: "Prishtinë",
    price: 400,
    currency: "€",
    type: "RENT",
    category: "APARTMENT",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    parking: 0,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
    isExclusive: true,
    hasBalcony: true,
    hasParking: false,
    hasElevator: true,
    isFurnished: true,
    hasAC: true,
    hasHeating: true,
    description: "Cozy studio apartment perfect for students or young professionals",
    address: "Rr. Zenel Salihu, Prishtinë",
    city: "Prishtinë",
    postalCode: "10000",
    latitude: 42.6629,
    longitude: 21.1655
  },
  {
    title: "Spacious Family House",
    location: "Prishtinë",
    price: 800,
    currency: "€",
    type: "RENT",
    category: "HOUSE",
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    parking: 2,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
    isExclusive: true,
    hasBalcony: true,
    hasParking: true,
    hasElevator: false,
    isFurnished: true,
    hasAC: true,
    hasHeating: true,
    description: "Spacious family house with garden and modern amenities",
    address: "Rr. Zenel Salihu, Prishtinë",
    city: "Prishtinë",
    postalCode: "10000",
    latitude: 42.6629,
    longitude: 21.1655
  }
]

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.property.deleteMany()
  console.log('Cleared existing data')

  // Insert new data
  for (const property of properties) {
    await prisma.property.create({
      data: property
    })
  }
  console.log('Inserted new data')

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 