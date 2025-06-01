import { prisma } from '@/lib/server/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await prisma.$connect()
    return NextResponse.json({ status: 'connected' })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ error: 'Failed to connect to database' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 