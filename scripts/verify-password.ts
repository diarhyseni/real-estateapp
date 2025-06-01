import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function verifyPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@rokarealestate.com'
      }
    })

    if (!user) {
      console.log('User not found')
      return
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      passwordHash: user.password
    })

    const testPassword = 'Admin123!'
    const isValid = await bcrypt.compare(testPassword, user.password || '')
    console.log('Password validation result:', isValid)

    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 10)
    console.log('New hash for comparison:', newHash)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyPassword() 