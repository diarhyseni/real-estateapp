import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { NextRequest } from 'next/server'

// DELETE property
export async function DELETE(
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ id: string }> }
) {
  const params = await promisedParams;
  try {
    await prisma.property.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}

// UPDATE property
export async function PUT(
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ id: string }> }
) {
  const params = await promisedParams;
  try {
    const body = await request.json();
    // Validate required fields
    const requiredFields = ['title', 'type', 'categoryId', 'location', 'area'];
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Only update allowed fields
    const updateData = {
      title: body.title,
      description: body.description || '',
      price: body.price ? parseFloat(body.price) : 0,
      currency: body.currency || '€',
      typeRelation: body.typeId ? { connect: { id: body.typeId } } : undefined,
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
    };

    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: updateData,
    });
    return NextResponse.json(updatedProperty);
  } catch (error: any) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ id: string }> }
) {
  const params = await promisedParams;
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing property ID" }, { status: 400 });
  }
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
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
    });
    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(property);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 