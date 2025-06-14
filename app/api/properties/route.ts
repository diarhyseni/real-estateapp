import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type PropertyWithRelations = {
  id: string
  title: string
  location: string
  price: number
  currency: string
  typeId: string | null
  categoryId: string
  userId: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number
  parking: number | null
  isExclusive: boolean
  createdAt: Date
  updatedAt: Date
  hasBalcony: boolean
  hasElevator: boolean
  hasHeating: boolean
  description: string | null
  latitude: string | null
  longitude: string | null
  characteristics: string[]
  hasAirConditioning: boolean
  hasGarden: boolean
  hasInternet: boolean
  hasPool: boolean
  hasSecurity: boolean
  images: string[]
  nearbyPlaces: string[]
  areaUnit: string
  statuses: string[]
  googleMapsIframe: string | null
  address: string | null
  city: string | null
  category: {
    id: string
    name: string
    value: string
  }
  typeRelation: {
    id: string
    name: string
    value: string
  } | null
  user: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  } | null
}

export async function GET(request: Request) {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('Database connection successful')
    } catch (error) {
      console.error('Database connection failed:', error)
      return NextResponse.json(
        { 
          error: 'Database connection failed', 
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
        },
        { status: 500 }
      )
    }

    const searchParams = new URL(request.url).searchParams
    console.log('API received query:', Object.fromEntries(searchParams.entries()))
    
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minArea = searchParams.get('minArea')
    const maxArea = searchParams.get('maxArea')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    const search = searchParams.get('search')
    const hasStatus = searchParams.get('hasStatus')
    const status = searchParams.get('status')

    const where: any = {}

    try {
      // Support filtering by status (SALE, RENT, EXCLUSIVE)
      if (hasStatus === 'EXCLUSIVE' || status === 'EXCLUSIVE') {
        where.isExclusive = true
      } else if (status === 'SALE' || status === 'RENT') {
        where.statuses = { has: status }
      } else {
        // For non-exclusive queries, add other filters
        if (type) {
          // Try to find the type by value
          const typeRecord = await prisma.type.findUnique({ where: { value: type } });
          if (typeRecord) {
            where.typeId = typeRecord.id;
          } else {
            // fallback: try to use as id
            where.typeId = type;
          }
        }
        if (category) where.categoryId = category

        if (minPrice || maxPrice) {
          where.price = {}
          if (minPrice) where.price.gte = Number(minPrice)
          if (maxPrice) where.price.lte = Number(maxPrice)
        }

        if (minArea || maxArea) {
          where.area = {}
          if (minArea) where.area.gte = parseFloat(minArea)
          if (maxArea) where.area.lte = parseFloat(maxArea)
        }

        if (bedrooms) where.bedrooms = parseInt(bedrooms)
        if (bathrooms) where.bathrooms = parseInt(bathrooms)

        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } }
          ]
        }
      }

      console.log('Query where clause:', JSON.stringify(where, null, 2))

      const properties = await prisma.property.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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

      // Transform the data to match our types
      const transformedProperties = properties.map((property: PropertyWithRelations) => ({
        ...property,
        type: property.typeRelation?.value || null,
        user: property.user ? {
          id: property.user.id,
          name: property.user.name,
          email: property.user.email,
          phone: property.user.phone,
          image: property.user.image
        } : undefined
      }))

      console.log(`Found ${properties.length} properties`)
      return NextResponse.json(transformedProperties)
    } catch (dbError) {
      console.error('Database query error:', {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
        where: where
      })
      return NextResponse.json(
        {
          error: 'Database query error',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
          stack: process.env.NODE_ENV === 'development' ? (dbError as Error).stack : undefined
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in /api/properties:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    return NextResponse.json(
      { 
        error: 'Error fetching properties',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('Database connection successful')
    } catch (error) {
      console.error('Database connection failed:', error)
      return NextResponse.json(
        { error: 'Database connection failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

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

    // Parse request data
    let data
    try {
      data = await req.json()
      console.log('Received property data:', JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error('Error parsing request data:', parseError)
      return NextResponse.json(
        { error: 'Invalid request data', details: parseError instanceof Error ? parseError.message : 'Unknown error' },
        { status: 400 }
      )
    }

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

    // Validate numeric fields - only validate area since price can be text
    if (isNaN(Number(data.area))) {
      console.log('Invalid area value:', data.area)
      return NextResponse.json(
        { error: 'Area must be a valid number' },
        { status: 400 }
      )
    }

    // Create property
    try {
      console.log('Creating property with data:', JSON.stringify(data, null, 2))
      
      // Validate data types before creating
      const propertyData = {
        title: data.title,
        description: data.description || '',
        price: data.price ? parseFloat(data.price) : 0,
        currency: data.currency || '€',
        typeRelation: data.typeId ? { connect: { id: data.typeId } } : undefined,
        category: { connect: { id: data.categoryId || data.category } },
        user: session?.user?.id ? { connect: { id: session.user.id } } : undefined,
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
              email: true,
              phone: true,
              image: true
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
          email: property.user.email,
          phone: property.user.phone,
          image: property.user.image
        } : undefined
      }

      console.log('Successfully created property:', transformedProperty)
      return NextResponse.json(transformedProperty)
    } catch (dbError) {
      console.error('Database error details:', {
        message: (dbError as Error).message,
        code: (dbError as any).code,
        meta: (dbError as any).meta,
        stack: (dbError as Error).stack
      })
      return NextResponse.json(
        { 
          error: 'Database error',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
          code: (dbError as any).code,
          meta: (dbError as any).meta
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { 
        error: 'Server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    )
  }
} 