import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const property = await prisma.property.findUnique({
      where: { id },
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

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check authentication
    const session = await getServerSession(authOptions)
    console.log('Session:', session) // Debug log

    if (!session?.user) {
      console.log('Authentication failed: No session or user')
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to update properties' },
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

    const body = await request.json()
    console.log('Received update data:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    const requiredFields = ['title', 'categoryId', 'location', 'area']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (isNaN(Number(body.area))) {
      console.log('Invalid area value:', body.area)
      return NextResponse.json(
        { error: 'Area must be a valid number' },
        { status: 400 }
      )
    }

    // Find type ID if type is provided
    let typeId = body.typeId
    if (body.type && !body.typeId) {
      const typeRecord = await prisma.type.findUnique({ 
        where: { value: body.type } 
      })
      typeId = typeRecord?.id
    }

    // Prepare the update data
    const updateData = {
      title: body.title,
      description: body.description || '',
      price: body.price ? parseFloat(body.price) : 0,
      currency: body.currency || '€',
      typeRelation: typeId ? { connect: { id: typeId } } : undefined,
      category: { connect: { id: body.categoryId } },
      location: body.location,
      area: Number(body.area),
      areaUnit: body.areaUnit || 'm2',
      bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
      parking: body.parking ? Number(body.parking) : null,
      hasBalcony: Boolean(body.hasBalcony),
      hasGarden: Boolean(body.hasGarden),
      hasPool: Boolean(body.hasPool),
      hasSecurity: Boolean(body.hasSecurity),
      hasAirConditioning: Boolean(body.hasAirConditioning),
      hasHeating: Boolean(body.hasHeating),
      hasInternet: Boolean(body.hasInternet),
      hasElevator: Boolean(body.hasElevator),
      isExclusive: Boolean(body.isExclusive),
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      characteristics: Array.isArray(body.characteristics) ? body.characteristics : [],
      nearbyPlaces: Array.isArray(body.nearbyPlaces) ? body.nearbyPlaces : [],
      images: Array.isArray(body.images) ? body.images : [],
      statuses: Array.isArray(body.statuses) ? body.statuses : [],
      googleMapsIframe: body.googleMapsIframe || null,
      address: body.address || '',
      city: body.city || '',
    }

    console.log('Validated update data:', JSON.stringify(updateData, null, 2))

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
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

    console.log('Successfully updated property:', transformedProperty)
    return NextResponse.json(transformedProperty)
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check authentication
    const session = await getServerSession(authOptions)
    console.log('Delete - Session:', session) // Debug log

    if (!session?.user) {
      console.log('Delete - Authentication failed: No session or user')
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to delete properties' },
        { status: 401 }
      )
    }

    // Check if user is admin or agent
    if (session.user.role !== 'admin' && session.user.role !== 'agent') {
      console.log('Delete - Authorization failed: User is not admin or agent')
      return NextResponse.json(
        { error: 'Forbidden - Admin or agent access required' },
        { status: 403 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Delete the property
    await prisma.property.delete({
      where: { id }
    })

    console.log('Successfully deleted property:', id)
    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 