import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const categoryMap = new Map();

async function main() {
  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Seeding database...');
  
  // Create admin user with fresh password hash
  const adminPassword = "Admin123!";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@rokarealestate.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log('Admin user created:', {
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
    passwordHash: adminUser.password
  });

  // Create categories
  const categories = [
    { id: 'HOUSE', name: 'Shtëpi', value: 'house' },
    { id: 'APARTMENT', name: 'Banesë', value: 'apartment' },
    { id: 'OFFICE', name: 'Zyre', value: 'office' },
    { id: 'COMMERCIAL', name: 'Hapësirë komerciale', value: 'commercial' },
    { id: 'LAND', name: 'Tokë', value: 'land' },
    { id: 'WAREHOUSE', name: 'Depo', value: 'warehouse' },
    { id: 'BUILDING', name: 'Ndërtesë', value: 'building' }
  ];

  for (const category of categories) {
    const result = await prisma.category.create({
      data: category
    });
    categoryMap.set(category.id, result.id);
  }

  // Get all categories for reference
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c: { value: string; id: string }) => [c.value, c.id]));

  // Now create properties with categoryId
  const properties = [
    {
      title: "Modern Apartment in City Center",
      description: "Beautiful modern apartment in a prime location.",
      price: 120000,
      currency: "€",
      type: "SALE",
      categoryId: categoryMap.get("APARTMENT"),
      location: "Prishtina",
      area: 85,
      bedrooms: 2,
      bathrooms: 1,
      parking: 1,
      hasBalcony: true,
      hasGarden: false,
      hasPool: false,
      hasSecurity: false,
      hasAirConditioning: true,
      hasHeating: true,
      hasInternet: false,
      hasElevator: true,
      isExclusive: true,
      latitude: "42.6630",
      longitude: "21.1656",
      characteristics: ["modern", "central"],
      nearbyPlaces: ["city center"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      title: "Luxury Villa with Garden",
      description: "Spacious villa with beautiful garden and modern amenities.",
      price: 350000,
      currency: "€",
      type: "SALE",
      categoryId: categoryMap.get("HOUSE"),
      location: "Prishtina",
      area: 250,
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
      hasBalcony: true,
      hasGarden: true,
      hasPool: true,
      hasSecurity: true,
      hasAirConditioning: true,
      hasHeating: true,
      hasInternet: false,
      hasElevator: false,
      isExclusive: true,
      latitude: "42.6631",
      longitude: "21.1657",
      characteristics: ["luxury", "garden"],
      nearbyPlaces: ["park"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      title: "Office Space in Business District",
      description: "Modern office space in the business district.",
      price: 200000,
      currency: "€",
      type: "SALE",
      categoryId: categoryMap.get("OFFICE"),
      location: "Prishtina",
      area: 150,
      bedrooms: null,
      bathrooms: null,
      parking: 5,
      hasBalcony: true,
      hasGarden: false,
      hasPool: false,
      hasSecurity: false,
      hasAirConditioning: true,
      hasHeating: true,
      hasInternet: false,
      hasElevator: true,
      isExclusive: true,
      latitude: "42.6632",
      longitude: "21.1658",
      characteristics: ["business", "modern"],
      nearbyPlaces: ["business district"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      title: "Land for Development",
      description: "Large plot of land in a developing area, perfect for residential or commercial development.",
      price: 500000,
      currency: "€",
      type: "SALE",
      categoryId: categoryMap.get("LAND"),
      location: "Prishtina",
      area: 1000,
      bedrooms: null,
      bathrooms: null,
      parking: null,
      hasBalcony: false,
      hasGarden: false,
      hasPool: false,
      hasSecurity: false,
      hasAirConditioning: false,
      hasHeating: false,
      hasInternet: false,
      hasElevator: false,
      isExclusive: true,
      latitude: "42.6633",
      longitude: "21.1659",
      characteristics: ["land", "development"],
      nearbyPlaces: ["developing area"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      title: "Penthouse with City View",
      description: "Luxurious penthouse with panoramic city views and modern amenities.",
      price: 450000,
      currency: "€",
      type: "SALE",
      categoryId: categoryMap.get("APARTMENT"),
      location: "Prishtina",
      area: 180,
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      hasBalcony: true,
      hasGarden: false,
      hasPool: false,
      hasSecurity: false,
      hasAirConditioning: true,
      hasHeating: true,
      hasInternet: false,
      hasElevator: true,
      isExclusive: true,
      latitude: "42.6637",
      longitude: "21.1663",
      characteristics: ["penthouse", "city view"],
      nearbyPlaces: ["city center"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
    // RENT Properties
    {
      title: "Cozy Studio Apartment",
      description: "Cozy studio apartment perfect for students.",
      price: 350,
      currency: "€",
      type: "RENT",
      categoryId: categoryMap.get("APARTMENT"),
      location: "Prishtina",
      area: 45,
      bedrooms: 1,
      bathrooms: 1,
      parking: 1,
      hasBalcony: true,
      hasGarden: false,
      hasPool: false,
      hasSecurity: false,
      hasAirConditioning: true,
      hasHeating: true,
      hasInternet: false,
      hasElevator: true,
      isExclusive: false,
      latitude: "42.6634",
      longitude: "21.1660",
      characteristics: ["studio", "cozy"],
      nearbyPlaces: ["university"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      title: "Family House for Rent",
      description: "Spacious family house in a quiet neighborhood.",
      price: 800,
      currency: "€",
      type: "RENT",
      categoryId: categoryMap.get("HOUSE"),
      location: "Prishtina",
      area: 180,
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      hasBalcony: true,
      hasGarden: true,
      hasPool: false,
      hasSecurity: false,
      hasAirConditioning: true,
      hasHeating: true,
      hasInternet: false,
      hasElevator: false,
      isExclusive: false,
      latitude: "42.6635",
      longitude: "21.1661",
      characteristics: ["family", "quiet neighborhood"],
      nearbyPlaces: ["school"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      title: "Commercial Space for Rent",
      description: "Modern commercial space for rent in a prime location.",
      price: 1500,
      currency: "€",
      type: "RENT",
      categoryId: categoryMap.get("COMMERCIAL"),
      location: "Prishtina",
      area: 120,
      bedrooms: null,
      bathrooms: null,
      parking: 3,
      hasBalcony: false,
      hasGarden: false,
      hasPool: false,
      hasSecurity: true,
      hasAirConditioning: true,
      hasHeating: true,
      hasInternet: true,
      hasElevator: true,
      isExclusive: false,
      latitude: "42.6636",
      longitude: "21.1662",
      characteristics: ["commercial", "prime location"],
      nearbyPlaces: ["main road"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
  ];

  for (const property of properties) {
    await prisma.property.create({
      data: property
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 