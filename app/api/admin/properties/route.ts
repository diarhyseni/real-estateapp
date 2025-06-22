import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        typeRelation: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    console.log('Session:', session) // Debug log

    if (!session?.user) {
      console.log('Authentication failed: No session or user')
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to create properties' },
        { status: 401 }
      )
    }

    // Check if user is admin or agent
    if (session.user.role !== 'admin' && session.user.role !== 'agent') {
      console.log('Authorization failed: User is not admin or agent')
      return NextResponse.json(
        { error: 'Forbidden - Admin or agent access required' },
        { status: 403 }
      )
    }

    const data = await req.json()
    console.log('Received property data:', JSON.stringify(data, null, 2))

    // Validate required fields
    const requiredFields = ['title', 'categoryId', 'location', 'area']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (isNaN(Number(data.area))) {
      console.log('Invalid area value:', data.area)
      return NextResponse.json(
        { error: 'Area must be a valid number' },
        { status: 400 }
      )
    }

    // Find type ID if type is provided
    let typeId = data.typeId
    if (data.type && !data.typeId) {
      const typeRecord = await prisma.type.findUnique({ 
        where: { value: data.type } 
      })
      typeId = typeRecord?.id
    }

    // Create property
    const propertyData = {
      title: data.title,
      description: data.description || '',
      price: data.price ? parseFloat(data.price) : 0,
      currency: data.currency || '€',
      typeRelation: typeId ? { connect: { id: typeId } } : undefined,
      category: { connect: { id: data.categoryId } },
      // Connect to the current admin/agent user
      user: { connect: { id: session.user.id } },
      location: data.location,
      area: Number(data.area),
      areaUnit: data.areaUnit || 'm2',
      bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
      bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
      parking: data.parking ? Number(data.parking) : null,
      hasBalcony: Boolean(data.hasBalcony),
      hasGarden: Boolean(data.hasGarden),
      hasPool: Boolean(data.hasPool),
      hasSecurity: Boolean(data.hasSecurity),
      hasAirConditioning: Boolean(data.hasAirConditioning),
      hasHeating: Boolean(data.hasHeating),
      hasInternet: Boolean(data.hasInternet),
      hasElevator: Boolean(data.hasElevator),
      isExclusive: Boolean(data.isExclusive),
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      characteristics: Array.isArray(data.characteristics) ? data.characteristics : [],
      nearbyPlaces: Array.isArray(data.nearbyPlaces) ? data.nearbyPlaces : [],
      images: Array.isArray(data.images) ? data.images : [],
      statuses: Array.isArray(data.statuses) ? data.statuses : [],
      googleMapsIframe: data.googleMapsIframe || null,
      address: data.address || '',
      city: data.city || '',
    }

    console.log('Validated property data:', JSON.stringify(propertyData, null, 2))

    const property = await prisma.property.create({
      data: propertyData,
      include: { 
        category: true,
        typeRelation: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Transform the response to match our types
    const transformedProperty = {
      ...property,
      type: property.typeRelation?.value,
      user: property.user ? {
        id: property.user.id,
        name: property.user.name,
        email: property.user.email
      } : undefined
    }

    console.log('Successfully created property:', transformedProperty)
    return NextResponse.json(transformedProperty)
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 