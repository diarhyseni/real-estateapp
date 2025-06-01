import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // First check if we can connect to the database
    await prisma.$connect()
    
    const types = await prisma.type.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    if (!types || !Array.isArray(types)) {
      return NextResponse.json([], { status: 200 })
    }

    // For each type, calculate property count by statuses array
    const typesWithCount = await Promise.all(types.map(async (type) => {
      try {
        const propertyCount = await prisma.property.count({
          where: {
            statuses: { has: type.value }
          }
        })
        return {
          id: type.id,
          name: type.name,
          value: type.value,
          _count: { properties: propertyCount }
        }
      } catch (error) {
        console.error(`Error counting properties for type ${type.id}:`, error)
        return {
          id: type.id,
          name: type.name,
          value: type.value,
          _count: { properties: 0 }
        }
      }
    }))

    return NextResponse.json(typesWithCount)
  } catch (error) {
    console.error('Error in /api/types GET:', error)
    return NextResponse.json([], { status: 200 }) // Return empty array instead of error
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    await prisma.$connect()
    const data = await request.json()
    
    if (!data.name || !data.value) {
      return NextResponse.json({ error: 'Name and value are required' }, { status: 400 })
    }

    const type = await prisma.type.create({
      data: {
        name: data.name,
        value: data.value.toUpperCase() // Ensure value is uppercase
      }
    })

    return NextResponse.json(type)
  } catch (error) {
    console.error('Error creating type:', error)
    return NextResponse.json({ error: 'Failed to create type' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 