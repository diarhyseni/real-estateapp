const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Deleting old properties...');
  
  const propertyIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  try {
    const result = await prisma.property.deleteMany({
      where: {
        id: {
          in: propertyIds
        }
      }
    });
    
    console.log(`Successfully deleted ${result.count} properties`);
  } catch (error) {
    console.error('Error deleting properties:', error);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 