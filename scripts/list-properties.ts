import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listProperties() {
  const properties = await prisma.property.findMany({
    include: {
      category: true,
      user: true
    }
  })
  console.log('Properties:', JSON.stringify(properties, null, 2))
}

listProperties()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  }) 