import { prisma } from '@/lib/server/db'
import bcrypt from 'bcryptjs'

async function main() {
  const adminEmail = 'admin@rokarealestate.com'
  const adminPassword = 'Admin123!'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('Admin user created successfully:', admin)
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 