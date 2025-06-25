import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { 
        category: true,
        typeRelation: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Transform the data to match our types
    const transformedProperty = {
      ...property,
      type: property.typeRelation?.value || null,
      user: property.user ? {
        id: property.user.id,
        name: property.user.name,
        email: property.user.email,
        phone: property.user.phone,
        image: property.user.image
      } : undefined
    }

    return NextResponse.json(transformedProperty)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
} 