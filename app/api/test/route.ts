import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Try to get a count of properties
    const count = await prisma.property.count()
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      propertyCount: count
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    )
  }
} 