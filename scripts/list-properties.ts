const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const properties = await prisma.property.findMany({
    where: {
      category: {
        in: ['HOUSE', 'APARTMENT']
      }
    }
  })
  console.log('Properties with category HOUSE or APARTMENT:', properties)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 